// src/lib/bookstore/database.types.ts
// Type stubs for the untelevised-shop Supabase project.
// Replace with output of `supabase gen types typescript` once the project is created.

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      customers: {
        Row: {
          id: string;
          clerk_user_id: string;
          email: string;
          full_name: string | null;
          phone: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          clerk_user_id: string;
          email: string;
          full_name?: string | null;
          phone?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          clerk_user_id?: string;
          email?: string;
          full_name?: string | null;
          phone?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      addresses: {
        Row: {
          id: string;
          customer_id: string;
          label: string | null;
          line1: string;
          line2: string | null;
          city: string;
          state: string;
          postal_code: string;
          country: string;
          is_default: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          customer_id: string;
          label?: string | null;
          line1: string;
          line2?: string | null;
          city: string;
          state: string;
          postal_code: string;
          country?: string;
          is_default?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          customer_id?: string;
          label?: string | null;
          line1?: string;
          line2?: string | null;
          city?: string;
          state?: string;
          postal_code?: string;
          country?: string;
          is_default?: boolean;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'addresses_customer_id_fkey';
            columns: ['customer_id'];
            isOneToOne: false;
            referencedRelation: 'customers';
            referencedColumns: ['id'];
          },
        ];
      };
      orders: {
        Row: {
          id: string;
          order_number: string;
          customer_id: string | null;
          stripe_payment_intent_id: string | null;
          stripe_checkout_session_id: string | null;
          status: string;
          subtotal_cents: number;
          tax_cents: number;
          shipping_cents: number;
          total_cents: number;
          currency: string;
          shipping_address_id: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
          fulfilled_at: string | null;
        };
        Insert: {
          id?: string;
          order_number: string;
          customer_id?: string | null;
          stripe_payment_intent_id?: string | null;
          stripe_checkout_session_id?: string | null;
          status?: string;
          subtotal_cents: number;
          tax_cents?: number;
          shipping_cents?: number;
          total_cents: number;
          currency?: string;
          shipping_address_id?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
          fulfilled_at?: string | null;
        };
        Update: {
          id?: string;
          order_number?: string;
          customer_id?: string | null;
          stripe_payment_intent_id?: string | null;
          stripe_checkout_session_id?: string | null;
          status?: string;
          subtotal_cents?: number;
          tax_cents?: number;
          shipping_cents?: number;
          total_cents?: number;
          currency?: string;
          shipping_address_id?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
          fulfilled_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'orders_customer_id_fkey';
            columns: ['customer_id'];
            isOneToOne: false;
            referencedRelation: 'customers';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'orders_shipping_address_id_fkey';
            columns: ['shipping_address_id'];
            isOneToOne: false;
            referencedRelation: 'addresses';
            referencedColumns: ['id'];
          },
        ];
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          sanity_book_id: string;
          sanity_format_type: string;
          book_title: string;
          format_label: string;
          unit_price_cents: number;
          quantity: number;
          stripe_price_id: string | null;
          is_digital: boolean;
          download_fulfilled: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          sanity_book_id: string;
          sanity_format_type: string;
          book_title: string;
          format_label: string;
          unit_price_cents: number;
          quantity?: number;
          stripe_price_id?: string | null;
          is_digital?: boolean;
          download_fulfilled?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          sanity_book_id?: string;
          sanity_format_type?: string;
          book_title?: string;
          format_label?: string;
          unit_price_cents?: number;
          quantity?: number;
          stripe_price_id?: string | null;
          is_digital?: boolean;
          download_fulfilled?: boolean;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'order_items_order_id_fkey';
            columns: ['order_id'];
            isOneToOne: false;
            referencedRelation: 'orders';
            referencedColumns: ['id'];
          },
        ];
      };
      digital_downloads: {
        Row: {
          id: string;
          order_item_id: string;
          customer_id: string;
          supabase_storage_path: string;
          signed_url: string | null;
          download_count: number;
          max_downloads: number;
          first_downloaded_at: string | null;
          last_downloaded_at: string | null;
          expires_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_item_id: string;
          customer_id: string;
          supabase_storage_path: string;
          signed_url?: string | null;
          download_count?: number;
          max_downloads?: number;
          first_downloaded_at?: string | null;
          last_downloaded_at?: string | null;
          expires_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          order_item_id?: string;
          customer_id?: string;
          supabase_storage_path?: string;
          signed_url?: string | null;
          download_count?: number;
          max_downloads?: number;
          first_downloaded_at?: string | null;
          last_downloaded_at?: string | null;
          expires_at?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'digital_downloads_order_item_id_fkey';
            columns: ['order_item_id'];
            isOneToOne: false;
            referencedRelation: 'order_items';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'digital_downloads_customer_id_fkey';
            columns: ['customer_id'];
            isOneToOne: false;
            referencedRelation: 'customers';
            referencedColumns: ['id'];
          },
        ];
      };
      payouts: {
        Row: {
          id: string;
          author_clerk_id: string;
          period_start: string;
          period_end: string;
          gross_cents: number;
          platform_fee_cents: number;
          net_cents: number;
          status: string;
          paid_at: string | null;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          author_clerk_id: string;
          period_start: string;
          period_end: string;
          gross_cents: number;
          platform_fee_cents?: number;
          net_cents: number;
          status?: string;
          paid_at?: string | null;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          author_clerk_id?: string;
          period_start?: string;
          period_end?: string;
          gross_cents?: number;
          platform_fee_cents?: number;
          net_cents?: number;
          status?: string;
          paid_at?: string | null;
          notes?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
