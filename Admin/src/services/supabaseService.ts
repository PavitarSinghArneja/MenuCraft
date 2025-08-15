import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Only create Supabase client if environment variables are properly configured
export const supabase = (supabaseUrl && supabaseAnonKey && supabaseUrl !== 'your_supabase_url_here') 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

export interface AdminUser {
  id: string;
  email: string;
  username: string;
  role: string;
  restaurantId: string;
  isActive: boolean;
  createdAt: Date;
  lastLogin: Date;
  created_at?: string; // Legacy compatibility
}

export interface GeneratedWebsite {
  id: string;
  name: string;
  slug: string;
  customer_url: string;
  kitchen_url: string;
  created_at: string;
  is_active: boolean;
  menu_items: number;
  total_orders: number;
  last_order_at?: string;
  user_id: string;
}

export class SupabaseService {
  // Authentication
  static async signUp(email: string, password: string) {
    if (!supabase) {
      throw new Error('Supabase not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file');
    }
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password
    });
    
    if (error) throw error;
    return data;
  }

  static async signIn(email: string, password: string) {
    if (!supabase) {
      throw new Error('Supabase not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file');
    }
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) throw error;
    return data;
  }

  static async signOut() {
    if (!supabase) {
      throw new Error('Supabase not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file');
    }
    
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }

  static async getCurrentUser(): Promise<AdminUser | null> {
    if (!supabase) {
      return null;
    }
    
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    
    return user ? {
      id: user.id,
      email: user.email!,
      username: user.user_metadata?.username || user.email!.split('@')[0],
      role: user.user_metadata?.role || 'admin',
      restaurantId: user.user_metadata?.restaurantId || '',
      isActive: true,
      createdAt: new Date(user.created_at!),
      lastLogin: new Date(),
      created_at: user.created_at!
    } : null;
  }

  // Website Management
  static async getGeneratedWebsites(userId: string): Promise<GeneratedWebsite[]> {
    if (!supabase) {
      throw new Error('Supabase not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file');
    }
    
    const { data, error } = await supabase
      .from('admin_websites')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  static async saveGeneratedWebsite(websiteData: Omit<GeneratedWebsite, 'id' | 'created_at'>): Promise<GeneratedWebsite> {
    if (!supabase) {
      throw new Error('Supabase not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file');
    }
    
    const { data, error } = await supabase
      .from('admin_websites')
      .insert([websiteData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async updateWebsiteStatus(websiteId: string, isActive: boolean): Promise<void> {
    if (!supabase) {
      throw new Error('Supabase not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file');
    }
    
    const { error } = await supabase
      .from('admin_websites')
      .update({ is_active: isActive })
      .eq('id', websiteId);
    
    if (error) throw error;
  }

  static async deleteWebsite(websiteId: string): Promise<void> {
    if (!supabase) {
      throw new Error('Supabase not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file');
    }
    
    const { error } = await supabase
      .from('admin_websites')
      .delete()
      .eq('id', websiteId);
    
    if (error) throw error;
  }

  // Check if user has reached the 1-site limit
  static async checkWebsiteLimit(userId: string): Promise<{ canCreate: boolean; existingWebsite?: GeneratedWebsite }> {
    if (!supabase) {
      throw new Error('Supabase not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file');
    }
    
    const websites = await this.getGeneratedWebsites(userId);
    
    if (websites.length >= 1) {
      return { canCreate: false, existingWebsite: websites[0] };
    }
    
    return { canCreate: true };
  }

  // Statistics for dashboard
  static async getDashboardStats(userId: string) {
    if (!supabase) {
      throw new Error('Supabase not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file');
    }
    
    const websites = await this.getGeneratedWebsites(userId);
    
    const totalOrders = websites.reduce((sum, site) => sum + site.total_orders, 0);
    const totalMenuItems = websites.reduce((sum, site) => sum + site.menu_items, 0);
    const activeWebsites = websites.filter(site => site.is_active).length;
    
    return {
      generatedSites: websites.length,
      totalOrders,
      totalMenuItems,
      activeWebsites,
      websites
    };
  }
}