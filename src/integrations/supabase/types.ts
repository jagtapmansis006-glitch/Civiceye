export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
      profiles: {
        Row: {
          avatar_url: string | null;
          created_at: string;
          email: string | null;
          full_name: string | null;
          id: string;
          phone: string | null;
          updated_at: string;
          ward: string | null;
        };
        Insert: {
          avatar_url?: string | null;
          created_at?: string;
          email?: string | null;
          full_name?: string | null;
          id: string;
          phone?: string | null;
          updated_at?: string;
          ward?: string | null;
        };
        Update: {
          avatar_url?: string | null;
          created_at?: string;
          email?: string | null;
          full_name?: string | null;
          id?: string;
          phone?: string | null;
          updated_at?: string;
          ward?: string | null;
        };
        Relationships: [];
      };
      report_media: {
        Row: {
          created_at: string;
          id: string;
          media_type: string;
          mime_type: string | null;
          report_id: string;
          size_bytes: number | null;
          storage_path: string;
          uploaded_by: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          media_type: string;
          mime_type?: string | null;
          report_id: string;
          size_bytes?: number | null;
          storage_path: string;
          uploaded_by: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          media_type?: string;
          mime_type?: string | null;
          report_id?: string;
          size_bytes?: number | null;
          storage_path?: string;
          uploaded_by?: string;
        };
        Relationships: [
          {
            foreignKeyName: "report_media_report_id_fkey";
            columns: ["report_id"];
            isOneToOne: false;
            referencedRelation: "reports";
            referencedColumns: ["id"];
          },
        ];
      };
      report_status_history: {
        Row: {
          changed_by: string | null;
          created_at: string;
          from_status: Database["public"]["Enums"]["report_status"] | null;
          id: string;
          note: string | null;
          report_id: string;
          to_status: Database["public"]["Enums"]["report_status"];
        };
        Insert: {
          changed_by?: string | null;
          created_at?: string;
          from_status?: Database["public"]["Enums"]["report_status"] | null;
          id?: string;
          note?: string | null;
          report_id: string;
          to_status: Database["public"]["Enums"]["report_status"];
        };
        Update: {
          changed_by?: string | null;
          created_at?: string;
          from_status?: Database["public"]["Enums"]["report_status"] | null;
          id?: string;
          note?: string | null;
          report_id?: string;
          to_status?: Database["public"]["Enums"]["report_status"];
        };
        Relationships: [
          {
            foreignKeyName: "report_status_history_report_id_fkey";
            columns: ["report_id"];
            isOneToOne: false;
            referencedRelation: "reports";
            referencedColumns: ["id"];
          },
        ];
      };
      reports: {
        Row: {
          address: string | null;
          ai_analysis: Json | null;
          ai_analyzed_at: string | null;
          assigned_to: string | null;
          category: Database["public"]["Enums"]["report_category"];
          closed_at: string | null;
          created_at: string;
          department: string | null;
          description: string;
          id: string;
          latitude: number | null;
          location: unknown;
          longitude: number | null;
          priority: Database["public"]["Enums"]["report_priority"] | null;
          reference_code: string;
          reporter_id: string;
          resolved_at: string | null;
          status: Database["public"]["Enums"]["report_status"];
          title: string;
          updated_at: string;
        };
        Insert: {
          address?: string | null;
          ai_analysis?: Json | null;
          ai_analyzed_at?: string | null;
          assigned_to?: string | null;
          category: Database["public"]["Enums"]["report_category"];
          closed_at?: string | null;
          created_at?: string;
          department?: string | null;
          description: string;
          id?: string;
          latitude?: number | null;
          location?: unknown;
          longitude?: number | null;
          priority?: Database["public"]["Enums"]["report_priority"] | null;
          reference_code?: string;
          reporter_id: string;
          resolved_at?: string | null;
          status?: Database["public"]["Enums"]["report_status"];
          title: string;
          updated_at?: string;
        };
        Update: {
          address?: string | null;
          ai_analysis?: Json | null;
          ai_analyzed_at?: string | null;
          assigned_to?: string | null;
          category?: Database["public"]["Enums"]["report_category"];
          closed_at?: string | null;
          created_at?: string;
          department?: string | null;
          description?: string;
          id?: string;
          latitude?: number | null;
          location?: unknown;
          longitude?: number | null;
          priority?: Database["public"]["Enums"]["report_priority"] | null;
          reference_code?: string;
          reporter_id?: string;
          resolved_at?: string | null;
          status?: Database["public"]["Enums"]["report_status"];
          title?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      user_roles: {
        Row: {
          created_at: string;
          id: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          role?: Database["public"]["Enums"]["app_role"];
          user_id?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      ensure_profile: { Args: never; Returns: undefined };
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"];
          _user_id: string;
        };
        Returns: boolean;
      };
      is_staff: { Args: { _user_id: string }; Returns: boolean };
    };
    Enums: {
      app_role: "citizen" | "field_worker" | "authority" | "admin";
      report_category:
        | "pothole"
        | "garbage"
        | "streetlight"
        | "damaged_road"
        | "drainage"
        | "water_leakage"
        | "infrastructure"
        | "other";
      report_priority: "low" | "medium" | "high" | "critical";
      report_status:
        | "submitted"
        | "ai_analysis"
        | "verified"
        | "assigned"
        | "in_progress"
        | "resolved"
        | "citizen_verification"
        | "closed";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    keyof DefaultSchema["CompositeTypes"] | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      app_role: ["citizen", "field_worker", "authority", "admin"],
      report_category: [
        "pothole",
        "garbage",
        "streetlight",
        "damaged_road",
        "drainage",
        "water_leakage",
        "infrastructure",
        "other",
      ],
      report_priority: ["low", "medium", "high", "critical"],
      report_status: [
        "submitted",
        "ai_analysis",
        "verified",
        "assigned",
        "in_progress",
        "resolved",
        "citizen_verification",
        "closed",
      ],
    },
  },
} as const;
