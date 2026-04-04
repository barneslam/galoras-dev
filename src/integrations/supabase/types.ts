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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      bookings: {
        Row: {
          coach_id: string | null
          created_at: string
          id: string
          product_id: string | null
          status: string
        }
        Insert: {
          coach_id?: string | null
          created_at?: string
          id?: string
          product_id?: string | null
          status?: string
        }
        Update: {
          coach_id?: string | null
          created_at?: string
          id?: string
          product_id?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "coaches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "coach_products"
            referencedColumns: ["id"]
          },
        ]
      }
      coach_applications: {
        Row: {
          availability_status: string | null
          avatar_url: string | null
          bio: string | null
          booking_url: string | null
          certification_interest: string | null
          coach_background: string | null
          coach_background_detail: string | null
          coaching_experience_level: string | null
          coaching_experience_years: number | null
          coaching_philosophy: string | null
          coaching_style: string | null
          commitment_level: string | null
          converted: boolean | null
          created_at: string | null
          current_role: string | null
          email: string
          engagement_model: string | null
          excitement_note: string | null
          exec_function: string | null
          exec_level: string | null
          founder_function_strength: string | null
          founder_stage_focus: string | null
          full_name: string | null
          id: string
          industry_focus: string | null
          leadership_experience_years: number | null
          linkedin_url: string | null
          methodology: string | null
          notes: string | null
          onboarding_status: string
          onboarding_token: string | null
          onboarding_token_expires_at: string | null
          phone: string | null
          pillar_specialties: string[] | null
          primary_join_reason: string | null
          primary_pillar: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          reviewer_notes: string | null
          secondary_pillars: string[] | null
          specialties: string[] | null
          start_timeline: string | null
          status: string | null
          updated_at: string | null
          user_id: string | null
          website_url: string | null
          why_galoras: string | null
        }
        Insert: {
          availability_status?: string | null
          avatar_url?: string | null
          bio?: string | null
          booking_url?: string | null
          certification_interest?: string | null
          coach_background?: string | null
          coach_background_detail?: string | null
          coaching_experience_level?: string | null
          coaching_experience_years?: number | null
          coaching_philosophy?: string | null
          coaching_style?: string | null
          commitment_level?: string | null
          converted?: boolean | null
          created_at?: string | null
          current_role?: string | null
          email: string
          engagement_model?: string | null
          excitement_note?: string | null
          exec_function?: string | null
          exec_level?: string | null
          founder_function_strength?: string | null
          founder_stage_focus?: string | null
          full_name?: string | null
          id?: string
          industry_focus?: string | null
          leadership_experience_years?: number | null
          linkedin_url?: string | null
          methodology?: string | null
          notes?: string | null
          onboarding_status?: string
          onboarding_token?: string | null
          onboarding_token_expires_at?: string | null
          phone?: string | null
          pillar_specialties?: string[] | null
          primary_join_reason?: string | null
          primary_pillar?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          reviewer_notes?: string | null
          secondary_pillars?: string[] | null
          specialties?: string[] | null
          start_timeline?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
          website_url?: string | null
          why_galoras?: string | null
        }
        Update: {
          availability_status?: string | null
          avatar_url?: string | null
          bio?: string | null
          booking_url?: string | null
          certification_interest?: string | null
          coach_background?: string | null
          coach_background_detail?: string | null
          coaching_experience_level?: string | null
          coaching_experience_years?: number | null
          coaching_philosophy?: string | null
          coaching_style?: string | null
          commitment_level?: string | null
          converted?: boolean | null
          created_at?: string | null
          current_role?: string | null
          email?: string
          engagement_model?: string | null
          excitement_note?: string | null
          exec_function?: string | null
          exec_level?: string | null
          founder_function_strength?: string | null
          founder_stage_focus?: string | null
          full_name?: string | null
          id?: string
          industry_focus?: string | null
          leadership_experience_years?: number | null
          linkedin_url?: string | null
          methodology?: string | null
          notes?: string | null
          onboarding_status?: string
          onboarding_token?: string | null
          onboarding_token_expires_at?: string | null
          phone?: string | null
          pillar_specialties?: string[] | null
          primary_join_reason?: string | null
          primary_pillar?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          reviewer_notes?: string | null
          secondary_pillars?: string[] | null
          specialties?: string[] | null
          start_timeline?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
          website_url?: string | null
          why_galoras?: string | null
        }
        Relationships: []
      }
      coach_products: {
        Row: {
          coach_id: string
          created_at: string
          cta_label: string
          cta_url: string | null
          duration_label: string | null
          duration_minutes: number | null
          format: string | null
          id: string
          is_active: boolean
          price_cents: number | null
          price_display: string | null
          pricing_band: string | null
          product_type: string
          sort_order: number
          summary: string | null
          title: string
          updated_at: string
          what_you_get: string[] | null
          who_its_for: string | null
        }
        Insert: {
          coach_id: string
          created_at?: string
          cta_label?: string
          cta_url?: string | null
          duration_label?: string | null
          duration_minutes?: number | null
          format?: string | null
          id?: string
          is_active?: boolean
          price_cents?: number | null
          price_display?: string | null
          pricing_band?: string | null
          product_type: string
          sort_order?: number
          summary?: string | null
          title: string
          updated_at?: string
          what_you_get?: string[] | null
          who_its_for?: string | null
        }
        Update: {
          coach_id?: string
          created_at?: string
          cta_label?: string
          cta_url?: string | null
          duration_label?: string | null
          duration_minutes?: number | null
          format?: string | null
          id?: string
          is_active?: boolean
          price_cents?: number | null
          price_display?: string | null
          pricing_band?: string | null
          product_type?: string
          sort_order?: number
          summary?: string | null
          title?: string
          updated_at?: string
          what_you_get?: string[] | null
          who_its_for?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "coach_products_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "coaches"
            referencedColumns: ["id"]
          },
        ]
      }
      coaches: {
        Row: {
          audience: string[] | null
          availability_status: string | null
          avatar_url: string | null
          bio: string | null
          booking_url: string | null
          coach_background: string | null
          coach_background_detail: string | null
          coaching_experience_level: string | null
          coaching_philosophy: string | null
          coaching_style: string | null
          companies_worked: string | null
          created_at: string | null
          current_role: string | null
          display_name: string | null
          email: string | null
          engagement_format: string | null
          engagement_model: string | null
          headline: string | null
          id: string
          industry: string | null
          industry_focus: string | null
          leadership_experience_years: number | null
          lifecycle_status: string | null
          linkedin_url: string | null
          methodology: string | null
          pillar: string | null
          pillar_specialties: string[] | null
          positioning_statement: string | null
          primary_pillar: string | null
          profile_complete: boolean | null
          profile_image_url: string | null
          proof_points: Json | null
          secondary_pillars: string[] | null
          slug: string | null
          specialties: string[] | null
          status: string | null
          sub_pillar: string | null
          tier: string | null
          updated_at: string | null
          user_id: string | null
          website_url: string | null
          years_experience: number | null
        }
        Insert: {
          audience?: string[] | null
          availability_status?: string | null
          avatar_url?: string | null
          bio?: string | null
          booking_url?: string | null
          coach_background?: string | null
          coach_background_detail?: string | null
          coaching_experience_level?: string | null
          coaching_philosophy?: string | null
          coaching_style?: string | null
          companies_worked?: string | null
          created_at?: string | null
          current_role?: string | null
          display_name?: string | null
          email?: string | null
          engagement_format?: string | null
          engagement_model?: string | null
          headline?: string | null
          id?: string
          industry?: string | null
          industry_focus?: string | null
          leadership_experience_years?: number | null
          lifecycle_status?: string | null
          linkedin_url?: string | null
          methodology?: string | null
          pillar?: string | null
          pillar_specialties?: string[] | null
          positioning_statement?: string | null
          primary_pillar?: string | null
          profile_complete?: boolean | null
          profile_image_url?: string | null
          proof_points?: Json | null
          secondary_pillars?: string[] | null
          slug?: string | null
          specialties?: string[] | null
          status?: string | null
          sub_pillar?: string | null
          tier?: string | null
          updated_at?: string | null
          user_id?: string | null
          website_url?: string | null
          years_experience?: number | null
        }
        Update: {
          audience?: string[] | null
          availability_status?: string | null
          avatar_url?: string | null
          bio?: string | null
          booking_url?: string | null
          coach_background?: string | null
          coach_background_detail?: string | null
          coaching_experience_level?: string | null
          coaching_philosophy?: string | null
          coaching_style?: string | null
          companies_worked?: string | null
          created_at?: string | null
          current_role?: string | null
          display_name?: string | null
          email?: string | null
          engagement_format?: string | null
          engagement_model?: string | null
          headline?: string | null
          id?: string
          industry?: string | null
          industry_focus?: string | null
          leadership_experience_years?: number | null
          lifecycle_status?: string | null
          linkedin_url?: string | null
          methodology?: string | null
          pillar?: string | null
          pillar_specialties?: string[] | null
          positioning_statement?: string | null
          primary_pillar?: string | null
          profile_complete?: boolean | null
          profile_image_url?: string | null
          proof_points?: Json | null
          secondary_pillars?: string[] | null
          slug?: string | null
          specialties?: string[] | null
          status?: string | null
          sub_pillar?: string | null
          tier?: string | null
          updated_at?: string | null
          user_id?: string | null
          website_url?: string | null
          years_experience?: number | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: string
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
