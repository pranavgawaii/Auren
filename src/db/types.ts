export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      emails: {
        Row: {
          id: string;
          user_id: string;
          gmail_id: string;
          thread_id: string;
          from_email: string;
          from_name: string;
          subject: string;
          snippet: string;
          body: string;
          priority: string;
          is_read: boolean;
          is_archived: boolean;
          embedding: number[] | null;
          received_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          gmail_id: string;
          thread_id: string;
          from_email: string;
          from_name: string;
          subject: string;
          snippet: string;
          body: string;
          priority: string;
          is_read?: boolean;
          is_archived?: boolean;
          embedding?: number[] | null;
          received_at: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          gmail_id?: string;
          thread_id?: string;
          from_email?: string;
          from_name?: string;
          subject?: string;
          snippet?: string;
          body?: string;
          priority?: string;
          is_read?: boolean;
          is_archived?: boolean;
          embedding?: number[] | null;
          received_at?: string;
          created_at?: string;
        };
      };
      calendar_events: {
        Row: {
          id: string;
          user_id: string;
          gcal_id: string;
          title: string;
          start_at: string;
          end_at: string;
          attendees: Json;
          location: string | null;
          zoom_link: string | null;
          description: string | null;
          prep_card_sent: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          gcal_id: string;
          title: string;
          start_at: string;
          end_at: string;
          attendees?: Json;
          location?: string | null;
          zoom_link?: string | null;
          description?: string | null;
          prep_card_sent?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          gcal_id?: string;
          title?: string;
          start_at?: string;
          end_at?: string;
          attendees?: Json;
          location?: string | null;
          zoom_link?: string | null;
          description?: string | null;
          prep_card_sent?: boolean;
          created_at?: string;
        };
      };
      agent_actions: {
        Row: {
          id: string;
          user_id: string;
          command: string;
          status: string;
          actions_taken: Json;
          error_message: string | null;
          created_at: string;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          command: string;
          status: string;
          actions_taken?: Json;
          error_message?: string | null;
          created_at?: string;
          completed_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          command?: string;
          status?: string;
          actions_taken?: Json;
          error_message?: string | null;
          created_at?: string;
          completed_at?: string | null;
        };
      };
      contacts: {
        Row: {
          id: string;
          user_id: string;
          email: string;
          name: string;
          relationship_summary: string | null;
          last_email_date: string | null;
          email_count: number;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          email: string;
          name: string;
          relationship_summary?: string | null;
          last_email_date?: string | null;
          email_count?: number;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          email?: string;
          name?: string;
          relationship_summary?: string | null;
          last_email_date?: string | null;
          email_count?: number;
          updated_at?: string;
        };
      };
      user_preferences: {
        Row: {
          id: string;
          user_id: string;
          reply_tone: string;
          working_hours_start: string;
          working_hours_end: string;
          timezone: string;
          github_repo: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          reply_tone?: string;
          working_hours_start?: string;
          working_hours_end?: string;
          timezone?: string;
          github_repo?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          reply_tone?: string;
          working_hours_start?: string;
          working_hours_end?: string;
          timezone?: string;
          github_repo?: string | null;
          created_at?: string;
        };
      };
      integrations: {
        Row: {
          id: string;
          user_id: string;
          provider: string;
          status: string;
          connected_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          provider: string;
          status?: string;
          connected_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          provider?: string;
          status?: string;
          connected_at?: string | null;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
