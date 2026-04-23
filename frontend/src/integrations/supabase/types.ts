export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      twitter_bots: {
        Row: {
          id: string
          bot_name: string
          status: 'active' | 'paused' | 'banned'
          last_activity: string | null
          created_at: string
          settings: Json | null
        }
        Insert: {
          id?: string
          bot_name: string
          status?: 'active' | 'paused' | 'banned'
          last_activity?: string | null
          created_at?: string
          settings?: Json | null
        }
        Update: {
          id?: string
          bot_name?: string
          status?: 'active' | 'paused' | 'banned'
          last_activity?: string | null
          settings?: Json | null
        }
      }
      bot_logs: {
        Row: {
          id: number
          bot_id: string
          message: string
          type: 'info' | 'error' | 'success'
          created_at: string
        }
        Insert: {
          id?: number
          bot_id: string
          message: string
          type?: 'info' | 'error' | 'success'
          created_at?: string
        }
        Update: {
          bot_id?: string
          message?: string
          type?: 'info' | 'error' | 'success'
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
      bot_status: 'active' | 'paused' | 'banned'
      log_type: 'info' | 'error' | 'success'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Yardımcı Tipler (Dokunma, otomatik türetilir)
type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">
type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<T extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])> = 
  (DefaultSchema["Tables"] & DefaultSchema["Views"])[T] extends { Row: infer R } ? R : never

export type TablesInsert<T extends keyof DefaultSchema["Tables"]> = 
  DefaultSchema["Tables"][T] extends { Insert: infer I } ? I : never

export type TablesUpdate<T extends keyof DefaultSchema["Tables"]> = 
  DefaultSchema["Tables"][T] extends { Update: infer U } ? U : never