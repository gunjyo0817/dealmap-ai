-- Dedupe HubSpot → notes sync per user
alter table public.notes
  add column if not exists hubspot_object_id text;

create unique index if not exists notes_user_hubspot_object_id_key
  on public.notes (user_id, hubspot_object_id)
  where hubspot_object_id is not null;
