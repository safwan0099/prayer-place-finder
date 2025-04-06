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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
