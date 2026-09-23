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
      collections: {
        Row: {
          active: boolean
          blurb: string
          cover_url: string
          created_at: string
          design_notes: string
          id: string
          name: string
          slug: string
          sort_order: number
          state: string
          story: string
          story_title: string
        }
        Insert: {
          active?: boolean
          blurb?: string
          cover_url?: string
          created_at?: string
          design_notes?: string
          id?: string
          name: string
          slug: string
          sort_order?: number
          state?: string
          story?: string
          story_title?: string
        }
        Update: {
          active?: boolean
          blurb?: string
          cover_url?: string
          created_at?: string
          design_notes?: string
          id?: string
          name?: string
          slug?: string
          sort_order?: number
          state?: string
          story?: string
          story_title?: string
        }
        Relationships: []
      }
      designs: {
        Row: {
          active: boolean
          collection_id: string
          created_at: string
          id: string
          image_url: string
          placements: string[]
          sort_order: number
          title: string
        }
        Insert: {
          active?: boolean
          collection_id: string
          created_at?: string
          id?: string
          image_url: string
          placements?: string[]
          sort_order?: number
          title: string
        }
        Update: {
          active?: boolean
          collection_id?: string
          created_at?: string
          id?: string
          image_url?: string
          placements?: string[]
          sort_order?: number
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "designs_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "collections"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          collection_name: string
          color_name: string
          created_at: string
          design_id: string | null
          id: string
          kind: string
          order_id: string
          placement_id: string
          product_id: string | null
          qty: number
          size: string
          title: string
          unit_price: number
          variant_id: string | null
        }
        Insert: {
          collection_name?: string
          color_name?: string
          created_at?: string
          design_id?: string | null
          id?: string
          kind?: string
          order_id: string
          placement_id?: string
          product_id?: string | null
          qty?: number
          size?: string
          title?: string
          unit_price?: number
          variant_id?: string | null
        }
        Update: {
          collection_name?: string
          color_name?: string
          created_at?: string
          design_id?: string | null
          id?: string
          kind?: string
          order_id?: string
          placement_id?: string
          product_id?: string | null
          qty?: number
          size?: string
          title?: string
          unit_price?: number
          variant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_items_design_id_fkey"
            columns: ["design_id"]
            isOneToOne: false
            referencedRelation: "designs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          code: string
          created_at: string
          customer_name: string
          customer_whatsapp: string
          id: string
          notes: string
          status: string
          total: number
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          customer_name?: string
          customer_whatsapp?: string
          id?: string
          notes?: string
          status?: string
          total?: number
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          customer_name?: string
          customer_whatsapp?: string
          id?: string
          notes?: string
          status?: string
          total?: number
          updated_at?: string
        }
        Relationships: []
      }
      product_variants: {
        Row: {
          color_hex: string
          color_name: string
          created_at: string
          id: string
          product_id: string
          size: string
          stock: number
        }
        Insert: {
          color_hex?: string
          color_name: string
          created_at?: string
          id?: string
          product_id: string
          size: string
          stock?: number
        }
        Update: {
          color_hex?: string
          color_name?: string
          created_at?: string
          id?: string
          product_id?: string
          size?: string
          stock?: number
        }
        Relationships: [
          {
            foreignKeyName: "product_variants_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          active: boolean
          back_image_url: string
          care: string
          category: string
          created_at: string
          description: string
          front_image_url: string
          id: string
          limited: boolean
          name: string
          price: number
          slug: string
          sort_order: number
        }
        Insert: {
          active?: boolean
          back_image_url?: string
          care?: string
          category?: string
          created_at?: string
          description?: string
          front_image_url?: string
          id?: string
          limited?: boolean
          name: string
          price?: number
          slug: string
          sort_order?: number
        }
        Update: {
          active?: boolean
          back_image_url?: string
          care?: string
          category?: string
          created_at?: string
          description?: string
          front_image_url?: string
          id?: string
          limited?: boolean
          name?: string
          price?: number
          slug?: string
          sort_order?: number
        }
        Relationships: []
      }
      site_texts: {
        Row: {
          key: string
          label: string
          updated_at: string
          value: string
        }
        Insert: {
          key: string
          label?: string
          updated_at?: string
          value?: string
        }
        Update: {
          key?: string
          label?: string
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      place_order: { Args: { payload: Json }; Returns: Json }
      set_order_status: {
        Args: { p_order_id: string; p_status: string }
        Returns: undefined
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
    Enums: {},
  },
} as const
