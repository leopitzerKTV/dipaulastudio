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
      album_photos: {
        Row: {
          author_name: string | null
          caption: string | null
          created_at: string
          id: string
          storage_path: string
          tag: string
        }
        Insert: {
          author_name?: string | null
          caption?: string | null
          created_at?: string
          id?: string
          storage_path: string
          tag?: string
        }
        Update: {
          author_name?: string | null
          caption?: string | null
          created_at?: string
          id?: string
          storage_path?: string
          tag?: string
        }
        Relationships: []
      }
      gift_items: {
        Row: {
          created_at: string
          currency: string
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean
          price_cents: number | null
          sort_order: number
          store_url: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          currency?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          price_cents?: number | null
          sort_order?: number
          store_url?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          currency?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          price_cents?: number | null
          sort_order?: number
          store_url?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      gift_reservations: {
        Row: {
          confirm_token: string
          confirmed_at: string | null
          created_at: string
          expires_at: string
          gift_item_id: string
          guest_email: string
          guest_name: string
          id: string
          reserved_at: string
          status: Database["public"]["Enums"]["gift_reservation_status"]
          updated_at: string
        }
        Insert: {
          confirm_token?: string
          confirmed_at?: string | null
          created_at?: string
          expires_at?: string
          gift_item_id: string
          guest_email: string
          guest_name: string
          id?: string
          reserved_at?: string
          status?: Database["public"]["Enums"]["gift_reservation_status"]
          updated_at?: string
        }
        Update: {
          confirm_token?: string
          confirmed_at?: string | null
          created_at?: string
          expires_at?: string
          gift_item_id?: string
          guest_email?: string
          guest_name?: string
          id?: string
          reserved_at?: string
          status?: Database["public"]["Enums"]["gift_reservation_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "gift_reservations_gift_item_id_fkey"
            columns: ["gift_item_id"]
            isOneToOne: false
            referencedRelation: "gift_items"
            referencedColumns: ["id"]
          },
        ]
      }
      guest_manual: {
        Row: {
          album_note: string | null
          cake_note: string | null
          ceremony_date: string | null
          ceremony_location: string | null
          ceremony_note: string | null
          ceremony_time: string | null
          closing_note: string | null
          created_at: string
          dancefloor_note: string | null
          dress_code_note: string | null
          during_ceremony_note: string | null
          gift_list_url: string | null
          gift_note: string | null
          id: string
          location_info: string | null
          parking_info: string | null
          reception_note: string | null
          transport_note: string | null
          updated_at: string
          welcome_note: string | null
        }
        Insert: {
          album_note?: string | null
          cake_note?: string | null
          ceremony_date?: string | null
          ceremony_location?: string | null
          ceremony_note?: string | null
          ceremony_time?: string | null
          closing_note?: string | null
          created_at?: string
          dancefloor_note?: string | null
          dress_code_note?: string | null
          during_ceremony_note?: string | null
          gift_list_url?: string | null
          gift_note?: string | null
          id?: string
          location_info?: string | null
          parking_info?: string | null
          reception_note?: string | null
          transport_note?: string | null
          updated_at?: string
          welcome_note?: string | null
        }
        Update: {
          album_note?: string | null
          cake_note?: string | null
          ceremony_date?: string | null
          ceremony_location?: string | null
          ceremony_note?: string | null
          ceremony_time?: string | null
          closing_note?: string | null
          created_at?: string
          dancefloor_note?: string | null
          dress_code_note?: string | null
          during_ceremony_note?: string | null
          gift_list_url?: string | null
          gift_note?: string | null
          id?: string
          location_info?: string | null
          parking_info?: string | null
          reception_note?: string | null
          transport_note?: string | null
          updated_at?: string
          welcome_note?: string | null
        }
        Relationships: []
      }
      rsvp_responses: {
        Row: {
          attending: boolean
          created_at: string
          guest_name: string
          id: string
          message: string | null
          party_size: number
          updated_at: string
        }
        Insert: {
          attending: boolean
          created_at?: string
          guest_name: string
          id?: string
          message?: string | null
          party_size?: number
          updated_at?: string
        }
        Update: {
          attending?: boolean
          created_at?: string
          guest_name?: string
          id?: string
          message?: string | null
          party_size?: number
          updated_at?: string
        }
        Relationships: []
      }
      story_chapters: {
        Row: {
          body: string
          created_at: string
          date_label: string
          event_date: string | null
          id: string
          position: number
          storage_path: string | null
          title: string
          updated_at: string
        }
        Insert: {
          body?: string
          created_at?: string
          date_label?: string
          event_date?: string | null
          id?: string
          position?: number
          storage_path?: string | null
          title?: string
          updated_at?: string
        }
        Update: {
          body?: string
          created_at?: string
          date_label?: string
          event_date?: string | null
          id?: string
          position?: number
          storage_path?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      timeline_milestones: {
        Row: {
          created_at: string
          date_label: string
          id: string
          position: number
          storage_path: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          date_label?: string
          id?: string
          position?: number
          storage_path?: string | null
          title?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          date_label?: string
          id?: string
          position?: number
          storage_path?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      saved_invites: {
        Row: {
          bride_name: string
          city: string
          created_at: string
          date: string
          deleted_at: string | null
          groom_name: string
          id: string
          image_data_url: string | null
          image_storage_path: string | null
          is_published: boolean | null
          label: string | null
          message: string | null
          palette_id: string | null
          published_url: string | null
          share_count: number
          tagline: string | null
          time: string
          updated_at: string
          user_id: string
          venue: string
          view_count: number
        }
        Insert: {
          bride_name: string
          city: string
          created_at?: string
          date: string
          deleted_at?: string | null
          groom_name: string
          id?: string
          image_data_url?: string | null
          image_storage_path?: string | null
          is_published?: boolean | null
          label?: string | null
          message?: string | null
          palette_id?: string | null
          published_url?: string | null
          share_count?: number
          tagline?: string | null
          time: string
          updated_at?: string
          user_id: string
          venue: string
          view_count?: number
        }
        Update: {
          bride_name?: string
          city?: string
          created_at?: string
          date?: string
          deleted_at?: string | null
          groom_name?: string
          id?: string
          image_data_url?: string | null
          image_storage_path?: string | null
          is_published?: boolean | null
          label?: string | null
          message?: string | null
          palette_id?: string | null
          published_url?: string | null
          share_count?: number
          tagline?: string | null
          time?: string
          updated_at?: string
          user_id?: string
          venue?: string
          view_count?: number
        }
        Relationships: []
      }
      user_roles: {
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cancel_gift_reservation: { Args: { _token: string }; Returns: boolean }
      confirm_gift_purchase: {
        Args: { _token: string }
        Returns: {
          gift_title: string
          reservation_id: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      list_gift_catalog: {
        Args: never
        Returns: {
          currency: string
          description: string
          id: string
          image_url: string
          is_available: boolean
          price_cents: number
          reserved_by_first_name: string
          sort_order: number
          store_url: string
          title: string
        }[]
      }
      reserve_gift_item: {
        Args: {
          _gift_item_id: string
          _guest_email: string
          _guest_name: string
        }
        Returns: {
          confirm_token: string
          expires_at: string
          reservation_id: string
        }[]
      }
      increment_share_count: {
        Args: {
          invite_id: string
        }
        Returns: void
      }
      increment_view_count: {
        Args: {
          invite_id: string
        }
        Returns: void
      }
      list_admin_users: {
        Args: never
        Returns: {
          user_id: string
          email: string
          name: string | null
          role: Database["public"]["Enums"]["app_role"]
          created_at: string
        }[]
      }
      add_admin_role: {
        Args: { _email: string, _name?: string, _role?: Database["public"]["Enums"]["app_role"] }
        Returns: {
          success: boolean
          error?: string
          user_id?: string
          role?: Database["public"]["Enums"]["app_role"]
        }
      }
      remove_admin_role: {
        Args: { _user_id: string }
        Returns: {
          success: boolean
          error?: string
        }
      }
      update_user_role: {
        Args: { _user_id: string, _new_role: Database["public"]["Enums"]["app_role"], _new_name?: string }
        Returns: {
          success: boolean
          error?: string
          role?: Database["public"]["Enums"]["app_role"]
        }
      }
    }
    Enums: {
      app_role: "couple" | "super_admin" | "admin" | "editor"
      gift_reservation_status: "reserved" | "purchased" | "cancelled"
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
      app_role: ["couple", "admin"],
      gift_reservation_status: ["reserved", "purchased", "cancelled"],
    },
  },
} as const
