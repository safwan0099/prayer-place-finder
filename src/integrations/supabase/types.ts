export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      mosques: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_restricted: boolean | null
          latitude: number
          longitude: number
          name: string
          operating_hours: Json
          osm_id: string | null
          source: string
          type: string | null
          website_url: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_restricted?: boolean | null
          latitude: number
          longitude: number
          name: string
          operating_hours?: Json
          osm_id?: string | null
          source?: string
          type?: string | null
          website_url?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_restricted?: boolean | null
          latitude?: number
          longitude?: number
          name?: string
          operating_hours?: Json
          osm_id?: string | null
          source?: string
          type?: string | null
          website_url?: string | null
        }
        Relationships: []
      }
      prayer_times: {
        Row: {
          asr: string | null
          created_at: string | null
          date: string
          dhuhr: string | null
          fajr: string | null
          id: string
          isha: string | null
          jummah: string | null
          maghrib: string | null
          mosque_id: string | null
          source_url: string | null
          updated_at: string | null
        }
        Insert: {
          asr?: string | null
          created_at?: string | null
          date: string
          dhuhr?: string | null
          fajr?: string | null
          id?: string
          isha?: string | null
          jummah?: string | null
          maghrib?: string | null
          mosque_id?: string | null
          source_url?: string | null
          updated_at?: string | null
        }
        Update: {
          asr?: string | null
          created_at?: string | null
          date?: string
          dhuhr?: string | null
          fajr?: string | null
          id?: string
          isha?: string | null
          jummah?: string | null
          maghrib?: string | null
          mosque_id?: string | null
          source_url?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "prayer_times_mosque_id_fkey"
            columns: ["mosque_id"]
            isOneToOne: false
            referencedRelation: "mosques"
            referencedColumns: ["id"]
          },
        ]
      }
      prayer_times_manchester: {
        Row: {
          asr: string | null
          created_at: string | null
          date: string
          dhuhr: string | null
          fajr: string | null
          id: string
          isha: string | null
          jummah: string | null
          maghrib: string | null
          mosque_id: string | null
          source_url: string | null
          updated_at: string | null
        }
        Insert: {
          asr?: string | null
          created_at?: string | null
          date: string
          dhuhr?: string | null
          fajr?: string | null
          id?: string
          isha?: string | null
          jummah?: string | null
          maghrib?: string | null
          mosque_id?: string | null
          source_url?: string | null
          updated_at?: string | null
        }
        Update: {
          asr?: string | null
          created_at?: string | null
          date?: string
          dhuhr?: string | null
          fajr?: string | null
          id?: string
          isha?: string | null
          jummah?: string | null
          maghrib?: string | null
          mosque_id?: string | null
          source_url?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "prayer_times_manchester_mosque_id_fkey"
            columns: ["mosque_id"]
            isOneToOne: false
            referencedRelation: "mosques"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          id: string
          is_admin: boolean | null
        }
        Insert: {
          created_at?: string
          email: string
          id: string
          is_admin?: boolean | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          is_admin?: boolean | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      insert_prayer_times: {
        Args: {
          p_mosque_id: string
          p_date: string
          p_fajr: string
          p_dhuhr: string
          p_asr: string
          p_maghrib: string
          p_isha: string
          p_jummah: string
          p_source_url: string
        }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
