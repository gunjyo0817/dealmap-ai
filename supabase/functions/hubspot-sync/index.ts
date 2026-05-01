import { createClient } from "https://esm.sh/@supabase/supabase-js@2.105.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function companyToNoteText(id: string, properties: Record<string, string | null | undefined>) {
  const name = properties.name?.trim() || "Company";
  const lines = [
    "Source: HubSpot Company",
    `HubSpot ID: ${id}`,
    `Name: ${name}`,
    properties.domain && `Domain: ${properties.domain}`,
    properties.website && `Website: ${properties.website}`,
    properties.industry && `Industry: ${properties.industry}`,
    properties.description && `Description: ${properties.description}`,
    (properties.city || properties.country) && `Location: ${[properties.city, properties.country].filter(Boolean).join(", ")}`,
    properties.numberofemployees && `Employees: ${properties.numberofemployees}`,
  ].filter(Boolean) as string[];
  return { title: `HubSpot · ${name}`, raw_text: lines.join("\n") };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return json({ error: "Missing Authorization header" }, 401);
  }

  const hubspotToken = Deno.env.get("HUBSPOT_PRIVATE_APP_TOKEN");
  if (!hubspotToken?.trim()) {
    return json(
      {
        error: "HubSpot not configured",
        hint: "Set secret: supabase secrets set HUBSPOT_PRIVATE_APP_TOKEN=your_private_app_token",
      },
      503,
    );
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const supabaseAnon = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
  const supabase = createClient(supabaseUrl, supabaseAnon, {
    global: { headers: { Authorization: authHeader } },
  });

  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) {
    return json({ error: "Unauthorized" }, 401);
  }

  const userId = authData.user.id;
  const body = await req.json().catch(() => ({}));
  const limit = Math.min(Math.max(Number(body.limit) || 50, 1), 100);

  const propertyNames = [
    "name",
    "domain",
    "description",
    "industry",
    "city",
    "country",
    "numberofemployees",
    "website",
  ];
  const qs = new URLSearchParams({
    limit: String(limit),
    properties: propertyNames.join(","),
  });

  const hsRes = await fetch(`https://api.hubapi.com/crm/v3/objects/companies?${qs}`, {
    headers: {
      Authorization: `Bearer ${hubspotToken.trim()}`,
      "Content-Type": "application/json",
    },
  });

  if (!hsRes.ok) {
    const detail = await hsRes.text();
    return json(
      {
        error: `HubSpot API error (${hsRes.status})`,
        detail: detail.slice(0, 800),
      },
      502,
    );
  }

  const hsJson = (await hsRes.json()) as { results?: Array<{ id: string; properties?: Record<string, string> }> };
  const results = hsJson.results ?? [];

  let imported = 0;
  let skipped = 0;

  for (const obj of results) {
    const hsId = String(obj.id);
    const props = obj.properties ?? {};

    const { data: existing } = await supabase
      .from("notes")
      .select("id")
      .eq("user_id", userId)
      .eq("hubspot_object_id", hsId)
      .maybeSingle();

    if (existing) {
      skipped++;
      continue;
    }

    const { title, raw_text } = companyToNoteText(hsId, props);

    const { error: insertError } = await supabase.from("notes").insert({
      user_id: userId,
      source: "hubspot",
      title,
      raw_text,
      status: "unprocessed",
      hubspot_object_id: hsId,
    });

    if (insertError) {
      return json({ error: insertError.message }, 500);
    }
    imported++;
  }

  return json({
    ok: true,
    imported,
    skipped,
    fetched: results.length,
  });
});
