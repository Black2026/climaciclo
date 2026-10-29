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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      admin_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      app_settings: {
        Row: {
          controller_document: string | null
          controller_name: string | null
          display_name: string
          id: number
          privacy_contact_channel: string | null
          privacy_updated_at: string | null
          ready_for_real_data: boolean | null
          retention_period: string | null
          updated_at: string
          updated_by: string | null
          whatsapp_enabled: boolean
          whatsapp_number: string | null
        }
        Insert: {
          controller_document?: string | null
          controller_name?: string | null
          display_name?: string
          id?: number
          privacy_contact_channel?: string | null
          privacy_updated_at?: string | null
          ready_for_real_data?: boolean | null
          retention_period?: string | null
          updated_at?: string
          updated_by?: string | null
          whatsapp_enabled?: boolean
          whatsapp_number?: string | null
        }
        Update: {
          controller_document?: string | null
          controller_name?: string | null
          display_name?: string
          id?: number
          privacy_contact_channel?: string | null
          privacy_updated_at?: string | null
          ready_for_real_data?: boolean | null
          retention_period?: string | null
          updated_at?: string
          updated_by?: string | null
          whatsapp_enabled?: boolean
          whatsapp_number?: string | null
        }
        Relationships: []
      }
      customers: {
        Row: {
          city: string
          created_at: string
          email: string | null
          id: string
          lead_id: string
          name: string
          neighborhood: string
          notes: string | null
          updated_at: string
          whatsapp: string
        }
        Insert: {
          city: string
          created_at?: string
          email?: string | null
          id?: string
          lead_id: string
          name: string
          neighborhood: string
          notes?: string | null
          updated_at?: string
          whatsapp: string
        }
        Update: {
          city?: string
          created_at?: string
          email?: string | null
          id?: string
          lead_id?: string
          name?: string
          neighborhood?: string
          notes?: string | null
          updated_at?: string
          whatsapp?: string
        }
        Relationships: [
          {
            foreignKeyName: "customers_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: true
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_rate_limits: {
        Row: {
          bucket: string
          count: number
          window_start: string
        }
        Insert: {
          bucket: string
          count?: number
          window_start: string
        }
        Update: {
          bucket?: string
          count?: number
          window_start?: string
        }
        Relationships: []
      }
      leads: {
        Row: {
          city: string
          consent: boolean
          consent_at: string
          consent_text_version: string
          created_at: string
          email: string | null
          environment_type: string
          follow_up_pref: string
          id: string
          idempotency_key: string
          interests: string[]
          internal_notes: string | null
          name: string
          neighborhood: string
          phone_hash: string
          public_code: string
          status: Database["public"]["Enums"]["lead_status"]
          unit_count: number
          unit_type: string
          updated_at: string
          whatsapp: string
        }
        Insert: {
          city: string
          consent: boolean
          consent_at?: string
          consent_text_version: string
          created_at?: string
          email?: string | null
          environment_type: string
          follow_up_pref: string
          id?: string
          idempotency_key: string
          interests: string[]
          internal_notes?: string | null
          name: string
          neighborhood: string
          phone_hash: string
          public_code: string
          status?: Database["public"]["Enums"]["lead_status"]
          unit_count: number
          unit_type: string
          updated_at?: string
          whatsapp: string
        }
        Update: {
          city?: string
          consent?: boolean
          consent_at?: string
          consent_text_version?: string
          created_at?: string
          email?: string | null
          environment_type?: string
          follow_up_pref?: string
          id?: string
          idempotency_key?: string
          interests?: string[]
          internal_notes?: string | null
          name?: string
          neighborhood?: string
          phone_hash?: string
          public_code?: string
          status?: Database["public"]["Enums"]["lead_status"]
          unit_count?: number
          unit_type?: string
          updated_at?: string
          whatsapp?: string
        }
        Relationships: []
      }
      reminders: {
        Row: {
          created_at: string
          customer_id: string
          done: boolean
          due_date: string
          id: string
          service_order_id: string | null
          title: string
        }
        Insert: {
          created_at?: string
          customer_id: string
          done?: boolean
          due_date: string
          id?: string
          service_order_id?: string | null
          title: string
        }
        Update: {
          created_at?: string
          customer_id?: string
          done?: boolean
          due_date?: string
          id?: string
          service_order_id?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "reminders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reminders_service_order_id_fkey"
            columns: ["service_order_id"]
            isOneToOne: false
            referencedRelation: "service_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      service_orders: {
        Row: {
          created_at: string
          customer_id: string
          id: string
          kind: string
          notes: string | null
          scheduled_note: string | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          customer_id: string
          id?: string
          kind: string
          notes?: string | null
          scheduled_note?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          customer_id?: string
          id?: string
          kind?: string
          notes?: string | null
          scheduled_note?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      convert_lead_to_customer: { Args: { p_lead_id: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      submit_lead: {
        Args: {
          p_city: string
          p_consent: boolean
          p_consent_text_version: string
          p_email: string
          p_environment_type: string
          p_follow_up_pref: string
          p_idempotency_key: string
          p_interests: string[]
          p_ip_hash: string
          p_name: string
          p_neighborhood: string
          p_phone_hash: string
          p_unit_count: number
          p_unit_type: string
          p_whatsapp: string
        }
        Returns: {
          created: boolean
          error: string
          public_code: string
        }[]
      }
    }
    Enums: {
      app_role: "admin"
      lead_status:
        | "novo"
        | "em_contato"
        | "orcamento_enviado"
        | "convertido"
        | "descartado"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      app_role: ["admin"],
      lead_status: [
        "novo",
        "em_contato",
        "orcamento_enviado",
        "convertido",
        "descartado",
      ],
    },
  },
} as const
