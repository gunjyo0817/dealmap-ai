export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      analyses: {
        Row: {
          ai_summary: string | null
          created_at: string
          id: string
          note_id: string | null
          opportunity_signals: string[] | null
          risk_signals: string[] | null
          startup_id: string | null
          user_id: string
        }
        Insert: {
          ai_summary?: string | null
          created_at?: string
          id?: string
          note_id?: string | null
          opportunity_signals?: string[] | null
          risk_signals?: string[] | null
          startup_id?: string | null
          user_id: string
        }
        Update: {
          ai_summary?: string | null
          created_at?: string
          id?: string
          note_id?: string | null
          opportunity_signals?: string[] | null
          risk_signals?: string[] | null
          startup_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "analyses_note_id_fkey"
            columns: ["note_id"]
            isOneToOne: false
            referencedRelation: "notes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analyses_startup_id_fkey"
            columns: ["startup_id"]
            isOneToOne: false
            referencedRelation: "startups"
            referencedColumns: ["id"]
          },
        ]
      }
      competitors: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          relationship_type: string | null
          startup_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          relationship_type?: string | null
          startup_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          relationship_type?: string | null
          startup_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "competitors_startup_id_fkey"
            columns: ["startup_id"]
            isOneToOne: false
            referencedRelation: "startups"
            referencedColumns: ["id"]
          },
        ]
      }
      follow_up_questions: {
        Row: {
          created_at: string
          id: string
          priority: Database["public"]["Enums"]["deal_priority"]
          question: string
          startup_id: string
          status: Database["public"]["Enums"]["followup_status"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          priority?: Database["public"]["Enums"]["deal_priority"]
          question: string
          startup_id: string
          status?: Database["public"]["Enums"]["followup_status"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          priority?: Database["public"]["Enums"]["deal_priority"]
          question?: string
          startup_id?: string
          status?: Database["public"]["Enums"]["followup_status"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "follow_up_questions_startup_id_fkey"
            columns: ["startup_id"]
            isOneToOne: false
            referencedRelation: "startups"
            referencedColumns: ["id"]
          },
        ]
      }
      insights: {
        Row: {
          confidence_score: number
          content: string | null
          created_at: string
          id: string
          recommended_action: string | null
          segment_id: string | null
          startup_id: string | null
          title: string
          type: Database["public"]["Enums"]["insight_type"]
          user_id: string
        }
        Insert: {
          confidence_score?: number
          content?: string | null
          created_at?: string
          id?: string
          recommended_action?: string | null
          segment_id?: string | null
          startup_id?: string | null
          title: string
          type: Database["public"]["Enums"]["insight_type"]
          user_id: string
        }
        Update: {
          confidence_score?: number
          content?: string | null
          created_at?: string
          id?: string
          recommended_action?: string | null
          segment_id?: string | null
          startup_id?: string | null
          title?: string
          type?: Database["public"]["Enums"]["insight_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "insights_segment_id_fkey"
            columns: ["segment_id"]
            isOneToOne: false
            referencedRelation: "market_segments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "insights_startup_id_fkey"
            columns: ["startup_id"]
            isOneToOne: false
            referencedRelation: "startups"
            referencedColumns: ["id"]
          },
        ]
      }
      market_segments: {
        Row: {
          created_at: string
          crowdedness_score: number
          description: string | null
          id: string
          name: string
          opportunity_score: number
          trend: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          crowdedness_score?: number
          description?: string | null
          id?: string
          name: string
          opportunity_score?: number
          trend?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          crowdedness_score?: number
          description?: string | null
          id?: string
          name?: string
          opportunity_score?: number
          trend?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notes: {
        Row: {
          created_at: string
          id: string
          raw_text: string
          source: Database["public"]["Enums"]["note_source"]
          startup_id: string | null
          status: Database["public"]["Enums"]["note_status"]
          title: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          raw_text: string
          source?: Database["public"]["Enums"]["note_source"]
          startup_id?: string | null
          status?: Database["public"]["Enums"]["note_status"]
          title?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          raw_text?: string
          source?: Database["public"]["Enums"]["note_source"]
          startup_id?: string | null
          status?: Database["public"]["Enums"]["note_status"]
          title?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notes_startup_id_fkey"
            columns: ["startup_id"]
            isOneToOne: false
            referencedRelation: "startups"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      startups: {
        Row: {
          created_at: string
          differentiation: string | null
          founder: string | null
          id: string
          last_interaction_at: string | null
          name: string
          priority: Database["public"]["Enums"]["deal_priority"]
          segment_id: string | null
          source: Database["public"]["Enums"]["note_source"] | null
          stage: Database["public"]["Enums"]["deal_stage"] | null
          status: Database["public"]["Enums"]["deal_status"]
          summary: string | null
          target_customer: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          differentiation?: string | null
          founder?: string | null
          id?: string
          last_interaction_at?: string | null
          name: string
          priority?: Database["public"]["Enums"]["deal_priority"]
          segment_id?: string | null
          source?: Database["public"]["Enums"]["note_source"] | null
          stage?: Database["public"]["Enums"]["deal_stage"] | null
          status?: Database["public"]["Enums"]["deal_status"]
          summary?: string | null
          target_customer?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          differentiation?: string | null
          founder?: string | null
          id?: string
          last_interaction_at?: string | null
          name?: string
          priority?: Database["public"]["Enums"]["deal_priority"]
          segment_id?: string | null
          source?: Database["public"]["Enums"]["note_source"] | null
          stage?: Database["public"]["Enums"]["deal_stage"] | null
          status?: Database["public"]["Enums"]["deal_status"]
          summary?: string | null
          target_customer?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "startups_segment_id_fkey"
            columns: ["segment_id"]
            isOneToOne: false
            referencedRelation: "market_segments"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      deal_priority: "High" | "Medium" | "Low"
      deal_stage: "Pre-seed" | "Seed" | "Series A" | "Series B" | "Later"
      deal_status:
        | "New"
        | "Researching"
        | "First call completed"
        | "Follow-up needed"
        | "Partner review"
        | "Passed"
        | "Tracking"
      followup_status: "open" | "answered" | "dismissed"
      insight_type:
        | "trend"
        | "crowded_market"
        | "whitespace"
        | "similar_alert"
        | "follow_up"
        | "missing_competitor"
      note_source: "hubspot" | "granola" | "manual"
      note_status: "unprocessed" | "analyzed" | "needs_review"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      deal_priority: ["High", "Medium", "Low"],
      deal_stage: ["Pre-seed", "Seed", "Series A", "Series B", "Later"],
      deal_status: [
        "New",
        "Researching",
        "First call completed",
        "Follow-up needed",
        "Partner review",
        "Passed",
        "Tracking",
      ],
      followup_status: ["open", "answered", "dismissed"],
      insight_type: [
        "trend",
        "crowded_market",
        "whitespace",
        "similar_alert",
        "follow_up",
        "missing_competitor",
      ],
      note_source: ["hubspot", "granola", "manual"],
      note_status: ["unprocessed", "analyzed", "needs_review"],
    },
  },
} as const
