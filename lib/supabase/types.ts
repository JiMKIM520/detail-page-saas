export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      platforms: {
        Row: { id: string; name: string; slug: string; style_guide: string | null; created_at: string }
        Insert: { id?: string; name: string; slug: string; style_guide?: string | null; created_at?: string }
        Update: { id?: string; name?: string; slug?: string; style_guide?: string | null; created_at?: string }
      }
      projects: {
        Row: { id: string; client_id: string; planner_id: string | null; designer_id: string | null; status: string; company_name: string; homepage_url: string | null; detail_page_url: string | null; product_highlights: string | null; reference_notes: string | null; platform_id: string | null; category: string | null; created_at: string; updated_at: string }
        Insert: { id?: string; client_id: string; planner_id?: string | null; designer_id?: string | null; status?: string; company_name: string; homepage_url?: string | null; detail_page_url?: string | null; product_highlights?: string | null; reference_notes?: string | null; platform_id?: string | null; category?: string | null; created_at?: string; updated_at?: string }
        Update: { id?: string; client_id?: string; planner_id?: string | null; designer_id?: string | null; status?: string; company_name?: string; homepage_url?: string | null; detail_page_url?: string | null; product_highlights?: string | null; reference_notes?: string | null; platform_id?: string | null; category?: string | null; created_at?: string; updated_at?: string }
      }
      scripts: {
        Row: { id: string; project_id: string; content: Json; ai_model: string | null; planner_status: string | null; planner_notes: string | null; version: number | null; created_at: string }
        Insert: { id?: string; project_id: string; content: Json; ai_model?: string | null; planner_status?: string | null; planner_notes?: string | null; version?: number | null; created_at?: string }
        Update: { id?: string; project_id?: string; content?: Json; ai_model?: string | null; planner_status?: string | null; planner_notes?: string | null; version?: number | null; created_at?: string }
      }
      photos: {
        Row: { id: string; project_id: string; storage_path: string; photo_type: string; is_retouched: boolean | null; retouched_path: string | null; shooting_list_item: string | null; created_at: string }
        Insert: { id?: string; project_id: string; storage_path: string; photo_type: string; is_retouched?: boolean | null; retouched_path?: string | null; shooting_list_item?: string | null; created_at?: string }
        Update: { id?: string; project_id?: string; storage_path?: string; photo_type?: string; is_retouched?: boolean | null; retouched_path?: string | null; shooting_list_item?: string | null; created_at?: string }
      }
      designs: {
        Row: { id: string; project_id: string; preview_url: string | null; output_url: string | null; designer_status: string | null; designer_notes: string | null; version: number | null; created_at: string }
        Insert: { id?: string; project_id: string; preview_url?: string | null; output_url?: string | null; designer_status?: string | null; designer_notes?: string | null; version?: number | null; created_at?: string }
        Update: { id?: string; project_id?: string; preview_url?: string | null; output_url?: string | null; designer_status?: string | null; designer_notes?: string | null; version?: number | null; created_at?: string }
      }
      project_logs: {
        Row: { id: string; project_id: string; from_status: string | null; to_status: string; changed_by: string | null; note: string | null; created_at: string }
        Insert: { id?: string; project_id: string; from_status?: string | null; to_status: string; changed_by?: string | null; note?: string | null; created_at?: string }
        Update: { id?: string; project_id?: string; from_status?: string | null; to_status?: string; changed_by?: string | null; note?: string | null; created_at?: string }
      }
    }
  }
}
