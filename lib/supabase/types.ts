export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      categories: {
        Row: { id: string; name: string; slug: string; legal_summary: string | null; tone: string | null; created_at: string }
        Insert: { id?: string; name: string; slug: string; legal_summary?: string | null; tone?: string | null; created_at?: string }
        Update: { id?: string; name?: string; slug?: string; legal_summary?: string | null; tone?: string | null; created_at?: string }
        Relationships: []
      }
      platforms: {
        Row: { id: string; name: string; slug: string; style_guide: string | null; created_at: string }
        Insert: { id?: string; name: string; slug: string; style_guide?: string | null; created_at?: string }
        Update: { id?: string; name?: string; slug?: string; style_guide?: string | null; created_at?: string }
        Relationships: []
      }
      projects: {
        Row: { id: string; client_id: string; planner_id: string | null; designer_id: string | null; status: string; company_name: string; homepage_url: string | null; detail_page_url: string | null; product_highlights: string | null; reference_notes: string | null; platform_id: string | null; category: string | null; category_id: string | null; brand_name: string | null; target_audience: Json | null; design_preference: string | null; created_at: string; updated_at: string }
        Insert: { id?: string; client_id: string; planner_id?: string | null; designer_id?: string | null; status?: string; company_name: string; homepage_url?: string | null; detail_page_url?: string | null; product_highlights?: string | null; reference_notes?: string | null; platform_id?: string | null; category?: string | null; category_id?: string | null; brand_name?: string | null; target_audience?: Json | null; design_preference?: string | null; created_at?: string; updated_at?: string }
        Update: { id?: string; client_id?: string; planner_id?: string | null; designer_id?: string | null; status?: string; company_name?: string; homepage_url?: string | null; detail_page_url?: string | null; product_highlights?: string | null; reference_notes?: string | null; platform_id?: string | null; category?: string | null; category_id?: string | null; brand_name?: string | null; target_audience?: Json | null; design_preference?: string | null; created_at?: string; updated_at?: string }
        Relationships: [
          { foreignKeyName: "projects_platform_id_fkey"; columns: ["platform_id"]; isOneToOne: false; referencedRelation: "platforms"; referencedColumns: ["id"] },
          { foreignKeyName: "projects_category_id_fkey"; columns: ["category_id"]; isOneToOne: false; referencedRelation: "categories"; referencedColumns: ["id"] },
        ]
      }
      scripts: {
        Row: { id: string; project_id: string; content: Json; ab_content: Json | null; ai_model: string | null; planner_status: string | null; planner_notes: string | null; version: number | null; created_at: string }
        Insert: { id?: string; project_id: string; content: Json; ab_content?: Json | null; ai_model?: string | null; planner_status?: string | null; planner_notes?: string | null; version?: number | null; created_at?: string }
        Update: { id?: string; project_id?: string; content?: Json; ab_content?: Json | null; ai_model?: string | null; planner_status?: string | null; planner_notes?: string | null; version?: number | null; created_at?: string }
        Relationships: []
      }
      photos: {
        Row: { id: string; project_id: string; storage_path: string; photo_type: string; is_retouched: boolean | null; retouched_path: string | null; shooting_list_item: string | null; created_at: string }
        Insert: { id?: string; project_id: string; storage_path: string; photo_type: string; is_retouched?: boolean | null; retouched_path?: string | null; shooting_list_item?: string | null; created_at?: string }
        Update: { id?: string; project_id?: string; storage_path?: string; photo_type?: string; is_retouched?: boolean | null; retouched_path?: string | null; shooting_list_item?: string | null; created_at?: string }
        Relationships: []
      }
      designs: {
        Row: { id: string; project_id: string; preview_url: string | null; preview_pdf_url: string | null; output_url: string | null; designer_status: string | null; designer_notes: string | null; version: number | null; created_at: string }
        Insert: { id?: string; project_id: string; preview_url?: string | null; preview_pdf_url?: string | null; output_url?: string | null; designer_status?: string | null; designer_notes?: string | null; version?: number | null; created_at?: string }
        Update: { id?: string; project_id?: string; preview_url?: string | null; preview_pdf_url?: string | null; output_url?: string | null; designer_status?: string | null; designer_notes?: string | null; version?: number | null; created_at?: string }
        Relationships: []
      }
      project_logs: {
        Row: { id: string; project_id: string; from_status: string | null; to_status: string; changed_by: string | null; note: string | null; created_at: string }
        Insert: { id?: string; project_id: string; from_status?: string | null; to_status: string; changed_by?: string | null; note?: string | null; created_at?: string }
        Update: { id?: string; project_id?: string; from_status?: string | null; to_status?: string; changed_by?: string | null; note?: string | null; created_at?: string }
        Relationships: []
      }
      user_profiles: {
        Row: { id: string; name: string | null; avatar_url: string | null; role: string; usage_count: number; usage_limit: number; created_at: string; updated_at: string }
        Insert: { id: string; name?: string | null; avatar_url?: string | null; role?: string; usage_count?: number; usage_limit?: number; created_at?: string; updated_at?: string }
        Update: { id?: string; name?: string | null; avatar_url?: string | null; role?: string; usage_count?: number; usage_limit?: number; created_at?: string; updated_at?: string }
        Relationships: []
      }
      intake_files: {
        Row: { id: string; project_id: string; file_type: string; storage_path: string; file_name: string; mime_type: string | null; file_size: number | null; created_at: string }
        Insert: { id?: string; project_id: string; file_type: string; storage_path: string; file_name: string; mime_type?: string | null; file_size?: number | null; created_at?: string }
        Update: { id?: string; project_id?: string; file_type?: string; storage_path?: string; file_name?: string; mime_type?: string | null; file_size?: number | null; created_at?: string }
        Relationships: []
      }
      comments: {
        Row: { id: string; project_id: string; user_id: string; content: string; role: string | null; created_at: string }
        Insert: { id?: string; project_id: string; user_id: string; content: string; role?: string | null; created_at?: string }
        Update: { id?: string; project_id?: string; user_id?: string; content?: string; role?: string | null; created_at?: string }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      increment_usage: {
        Args: { uid: string }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}
