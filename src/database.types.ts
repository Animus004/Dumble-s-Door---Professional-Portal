// To auto-generate this file, use the Supabase CLI:
// 1. Install Supabase CLI: npm i supabase -g
// 2. Login: supabase login
// 3. Link project: supabase link --project-ref YOUR_PROJECT_ID
// 4. Generate types: supabase gen types typescript --linked > src/database.types.ts

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
      // FIX: Add 'appointments' table definition.
      appointments: {
        Row: {
          appointment_date: string
          auth_user_id: string
          created_at: string
          id: string
          notes: string | null
          pet_id: string
          status: Database["public"]["Enums"]["appointment_status"]
          vet_id: string
        }
        Insert: {
          appointment_date: string
          auth_user_id: string
          created_at?: string
          id?: string
          notes?: string | null
          pet_id: string
          status: Database["public"]["Enums"]["appointment_status"]
          vet_id: string
        }
        Update: {
          appointment_date?: string
          auth_user_id?: string
          created_at?: string
          id?: string
          notes?: string | null
          pet_id?: string
          status?: Database["public"]["Enums"]["appointment_status"]
          vet_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_auth_user_id_fkey"
            columns: ["auth_user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_vet_id_fkey"
            columns: ["vet_id"]
            isOneToOne: false
            referencedRelation: "veterinarian_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      clinics: {
        Row: {
          clinic_address: string
          clinic_name: string
          clinic_phone: string
          google_place_id: string | null
          id: string
          latitude: number | null
          longitude: number | null
          vet_profile_id: string
          working_hours: Json | null
        }
        Insert: {
          clinic_address: string
          clinic_name: string
          clinic_phone: string
          google_place_id?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          vet_profile_id: string
          working_hours?: Json | null
        }
        Update: {
          clinic_address?: string
          clinic_name?: string
          clinic_phone?: string
          google_place_id?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          vet_profile_id?: string
          working_hours?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "clinics_vet_profile_id_fkey"
            columns: ["vet_profile_id"]
            isOneToOne: false
            referencedRelation: "veterinarian_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          link: string | null
          message: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          link?: string | null
          message: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          link?: string | null
          message?: string
          type?: Database["public"]["Enums"]["notification_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          brand: string | null
          category: Database["public"]["Enums"]["product_category"]
          description: string | null
          discounted_price: number | null
          id: string
          images: string[] | null
          name: string
          prescription_required: boolean
          price: number
          status: Database["public"]["Enums"]["product_status"]
          stock_quantity: number
          subcategory: string | null
          vendor_id: string
        }
        Insert: {
          brand?: string | null
          category: Database["public"]["Enums"]["product_category"]
          description?: string | null
          discounted_price?: number | null
          id?: string
          images?: string[] | null
          name: string
          prescription_required?: boolean
          price: number
          status?: Database["public"]["Enums"]["product_status"]
          stock_quantity?: number
          subcategory?: string | null
          vendor_id: string
        }
        Update: {
          brand?: string | null
          category?: Database["public"]["Enums"]["product_category"]
          description?: string | null
          discounted_price?: number | null
          id?: string
          images?: string[] | null
          name?: string
          prescription_required?: boolean
          price?: number
          status?: Database["public"]["Enums"]["product_status"]
          stock_quantity?: number
          subcategory?: string | null
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendor_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          created_at: string
          email: string
          id: string
          notification_preferences: Json | null
          professional_status: Database["public"]["Enums"]["professional_status"]
          role: Database["public"]["Enums"]["user_role"]
          subscription_status: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id: string
          notification_preferences?: Json | null
          professional_status?: Database["public"]["Enums"]["professional_status"]
          role?: Database["public"]["Enums"]["user_role"]
          subscription_status?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          notification_preferences?: Json | null
          professional_status?: Database["public"]["Enums"]["professional_status"]
          role?: Database["public"]["Enums"]["user_role"]
          subscription_status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_profiles: {
        Row: {
          business_address: string
          business_images: string[] | null
          business_name: string
          business_phone: string
          business_type: Database["public"]["Enums"]["business_type"]
          delivery_available: boolean
          delivery_radius_km: number | null
          description: string | null
          gst_number: string | null
          id: string
          license_number: string
          minimum_order_amount: number | null
          operating_hours: Json | null
          services_offered: string[] | null
          status: Database["public"]["Enums"]["professional_status"]
          user_id: string
        }
        Insert: {
          business_address: string
          business_images?: string[] | null
          business_name: string
          business_phone: string
          business_type: Database["public"]["Enums"]["business_type"]
          delivery_available?: boolean
          delivery_radius_km?: number | null
          description?: string | null
          gst_number?: string | null
          id?: string
          license_number: string
          minimum_order_amount?: number | null
          operating_hours?: Json | null
          services_offered?: string[] | null
          status?: Database["public"]["Enums"]["professional_status"]
          user_id: string
        }
        Update: {
          business_address?: string
          business_images?: string[] | null
          business_name?: string
          business_phone?: string
          business_type?: Database["public"]["Enums"]["business_type"]
          delivery_available?: boolean
          delivery_radius_km?: number | null
          description?: string | null
          gst_number?: string | null
          id?: string
          license_number?: string
          minimum_order_amount?: number | null
          operating_hours?: Json | null
          services_offered?: string[] | null
          status?: Database["public"]["Enums"]["professional_status"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vendor_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      verification_documents: {
        Row: {
          document_type: Database["public"]["Enums"]["document_type"]
          document_url: string
          id: string
          rejection_reason: string | null
          uploaded_at: string
          user_id: string
          verified_at: string | null
          verified_by: string | null
          verification_status: Database["public"]["Enums"]["verification_status"]
        }
        Insert: {
          document_type: Database["public"]["Enums"]["document_type"]
          document_url: string
          id?: string
          rejection_reason?: string | null
          uploaded_at?: string
          user_id: string
          verified_at?: string | null
          verified_by?: string | null
          verification_status?: Database["public"]["Enums"]["verification_status"]
        }
        Update: {
          document_type?: Database["public"]["Enums"]["document_type"]
          document_url?: string
          id?: string
          rejection_reason?: string | null
          uploaded_at?: string
          user_id?: string
          verified_at?: string | null
          verified_by?: string | null
          verification_status?: Database["public"]["Enums"]["verification_status"]
        }
        Relationships: [
          {
            foreignKeyName: "verification_documents_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "verification_documents_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      veterinarian_profiles: {
        Row: {
          bio: string | null
          clinic_images: string[] | null
          consultation_fee: number | null
          emergency_available: boolean
          experience_years: number
          full_name: string
          id: string
          languages_spoken: string[] | null
          license_number: string
          profile_image_url: string | null
          services_offered: string[] | null
          specializations: string[] | null
          status: Database["public"]["Enums"]["professional_status"]
          user_id: string
        }
        Insert: {
          bio?: string | null
          clinic_images?: string[] | null
          consultation_fee?: number | null
          emergency_available?: boolean
          experience_years: number
          full_name: string
          id?: string
          languages_spoken?: string[] | null
          license_number: string
          profile_image_url?: string | null
          services_offered?: string[] | null
          specializations?: string[] | null
          status?: Database["public"]["Enums"]["professional_status"]
          user_id: string
        }
        Update: {
          bio?: string | null
          clinic_images?: string[] | null
          consultation_fee?: number | null
          emergency_available?: boolean
          experience_years?: number
          full_name?: string
          id?: string
          languages_spoken?: string[] | null
          license_number?: string
          profile_image_url?: string | null
          services_offered?: string[] | null
          specializations?: string[] | null
          status?: Database["public"]["Enums"]["professional_status"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "veterinarian_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
    }
    Enums: {
      // FIX: Add 'appointment_status' enum definition.
      appointment_status: "pending" | "confirmed" | "cancelled" | "completed"
      business_type:
        | "pet_shop"
        | "pharmacy"
        | "grooming"
        | "boarding"
        | "training"
        | "other"
      document_type:
        | "license"
        | "degree"
        | "experience_certificate"
        | "clinic_registration"
        | "gst_certificate"
        | "business_license"
        | "pharmacy_license"
      notification_type:
        | "status_approved"
        | "status_rejected"
        | "new_applicant"
        | "document_reminder"
      product_category:
        | "food"
        | "medicine"
        | "toy"
        | "accessory"
        | "grooming"
        | "healthcare"
        | "supplement"
      product_status:
        | "draft"
        | "pending"
        | "approved"
        | "rejected"
        | "out_of_stock"
      professional_status: "pending" | "approved" | "rejected" | "suspended"
      user_role: "pet_parent" | "veterinarian" | "vendor" | "pharmacy" | "admin"
      verification_status: "pending" | "approved" | "rejected"
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