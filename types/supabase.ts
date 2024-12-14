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
      services: {
        Row: {
          id: string
          name: string
          description: string | null
          duration: number
          price: number
          category: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          duration: number
          price: number
          category: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          duration?: number
          price?: number
          category?: string
          created_at?: string
        }
      }
      staff: {
        Row: {
          id: string
          user_id: string | null
          name: string
          bio: string | null
          image_url: string | null
          created_at: string
          role: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          name: string
          bio?: string | null
          image_url?: string | null
          created_at?: string
          role?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          name?: string
          bio?: string | null
          image_url?: string | null
          created_at?: string
          role?: string | null
        }
      }
    }
  }
}