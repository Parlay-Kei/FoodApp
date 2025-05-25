export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          phone: string | null
          is_admin: boolean
          receive_sms: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          phone?: string | null
          is_admin?: boolean
          receive_sms?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          phone?: string | null
          is_admin?: boolean
          receive_sms?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          user_id: string
          status: 'pending' | 'in_progress' | 'ready' | 'completed' | 'cancelled'
          total_amount: number
          pickup_time: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          status?: 'pending' | 'in_progress' | 'ready' | 'completed' | 'cancelled'
          total_amount: number
          pickup_time: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          status?: 'pending' | 'in_progress' | 'ready' | 'completed' | 'cancelled'
          total_amount?: number
          pickup_time?: string
          created_at?: string
          updated_at?: string
        }
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          food_item_id: string
          quantity: number
          price_at_time: number
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          food_item_id: string
          quantity: number
          price_at_time: number
          created_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          food_item_id?: string
          quantity?: number
          price_at_time?: number
          created_at?: string
        }
      }
      food_items: {
        Row: {
          id: string
          name: string
          description: string
          price: number
          image_url: string | null
          is_vegan: boolean
          is_vegetarian: boolean
          is_spicy: boolean
          is_gluten_free: boolean
          quantity_available: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description: string
          price: number
          image_url?: string | null
          is_vegan?: boolean
          is_vegetarian?: boolean
          is_spicy?: boolean
          is_gluten_free?: boolean
          quantity_available: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          price?: number
          image_url?: string | null
          is_vegan?: boolean
          is_vegetarian?: boolean
          is_spicy?: boolean
          is_gluten_free?: boolean
          quantity_available?: number
          created_at?: string
          updated_at?: string
        }
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
  }
} 