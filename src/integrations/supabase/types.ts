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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      facilitators: {
        Row: {
          city: string | null
          created_at: string
          email: string
          id: string
          max_matches: number
          name: string
          notes: string | null
          org: string | null
          role: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          city?: string | null
          created_at?: string
          email: string
          id?: string
          max_matches?: number
          name: string
          notes?: string | null
          org?: string | null
          role?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          city?: string | null
          created_at?: string
          email?: string
          id?: string
          max_matches?: number
          name?: string
          notes?: string | null
          org?: string | null
          role?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "facilitators_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      invites: {
        Row: {
          accepted_by_mentor: boolean | null
          accepted_by_student: boolean | null
          created_at: string
          created_by: string | null
          id: string
          mentor_id: string
          reasons: string[] | null
          score: number
          status: string
          student_id: string
          updated_at: string
        }
        Insert: {
          accepted_by_mentor?: boolean | null
          accepted_by_student?: boolean | null
          created_at?: string
          created_by?: string | null
          id?: string
          mentor_id: string
          reasons?: string[] | null
          score: number
          status?: string
          student_id: string
          updated_at?: string
        }
        Update: {
          accepted_by_mentor?: boolean | null
          accepted_by_student?: boolean | null
          created_at?: string
          created_by?: string | null
          id?: string
          mentor_id?: string
          reasons?: string[] | null
          score?: number
          status?: string
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invites_mentor_id_fkey"
            columns: ["mentor_id"]
            isOneToOne: false
            referencedRelation: "mentors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invites_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      meetings: {
        Row: {
          created_at: string
          ends_at: string
          facilitator_id: string | null
          id: string
          location: string
          mentor_id: string
          notes: string | null
          starts_at: string
          student_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          ends_at: string
          facilitator_id?: string | null
          id?: string
          location: string
          mentor_id: string
          notes?: string | null
          starts_at: string
          student_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          ends_at?: string
          facilitator_id?: string | null
          id?: string
          location?: string
          mentor_id?: string
          notes?: string | null
          starts_at?: string
          student_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      mentors: {
        Row: {
          age_pref: string | null
          availability: string[] | null
          bio: string | null
          created_at: string
          email: string
          employer: string | null
          first_name: string
          hobbies: string[] | null
          id: string
          languages: string[]
          last_name: string
          max_students: number
          meeting_pref: string
          role: string | null
          skills: string[]
          updated_at: string
          user_id: string | null
        }
        Insert: {
          age_pref?: string | null
          availability?: string[] | null
          bio?: string | null
          created_at?: string
          email: string
          employer?: string | null
          first_name: string
          hobbies?: string[] | null
          id?: string
          languages?: string[]
          last_name: string
          max_students?: number
          meeting_pref?: string
          role?: string | null
          skills?: string[]
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          age_pref?: string | null
          availability?: string[] | null
          bio?: string | null
          created_at?: string
          email?: string
          employer?: string | null
          first_name?: string
          hobbies?: string[] | null
          id?: string
          languages?: string[]
          last_name?: string
          max_students?: number
          meeting_pref?: string
          role?: string | null
          skills?: string[]
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mentors_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          id: string
          photo_url: string | null
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id: string
          photo_url?: string | null
          role: Database["public"]["Enums"]["app_role"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          photo_url?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
        }
        Relationships: []
      }
      students: {
        Row: {
          availability: string[] | null
          city: string | null
          created_at: string
          email: string
          facilitator_id: string | null
          first_name: string
          goals: string | null
          grade: number
          id: string
          interests: string[]
          languages: string[]
          last_name: string
          meeting_pref: string
          school: string | null
          subjects: string[] | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          availability?: string[] | null
          city?: string | null
          created_at?: string
          email: string
          facilitator_id?: string | null
          first_name: string
          goals?: string | null
          grade: number
          id?: string
          interests?: string[]
          languages?: string[]
          last_name: string
          meeting_pref?: string
          school?: string | null
          subjects?: string[] | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          availability?: string[] | null
          city?: string | null
          created_at?: string
          email?: string
          facilitator_id?: string | null
          first_name?: string
          goals?: string | null
          grade?: number
          id?: string
          interests?: string[]
          languages?: string[]
          last_name?: string
          meeting_pref?: string
          school?: string | null
          subjects?: string[] | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "students_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "STUDENT" | "MENTOR" | "FACILITATOR"
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
      app_role: ["STUDENT", "MENTOR", "FACILITATOR"],
    },
  },
} as const
