// Optimized Storage Service for MenuCraft Admin
// Handles both localStorage caching and Supabase persistence

import { SupabaseService, GeneratedWebsite, AdminUser } from './supabaseService';

interface CachedData<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

interface UserPreferences {
  currentPage: string;
  sidebarCollapsed: boolean;
  theme: 'light' | 'dark';
  lastVisited: string;
}

export class StorageService {
  // Cache TTL settings (in milliseconds)
  private static readonly CACHE_TTL = {
    AUTH_SESSION: 24 * 60 * 60 * 1000, // 24 hours
    WEBSITES: 5 * 60 * 1000, // 5 minutes
    USER_PROFILE: 60 * 60 * 1000, // 1 hour
    DASHBOARD_STATS: 2 * 60 * 1000 // 2 minutes
  };

  // ===========================================
  // AUTHENTICATION & SESSION MANAGEMENT
  // ===========================================

  /**
   * Store auth session with local cache for quick access
   */
  static setAuthSession(user: AdminUser): void {
    const cachedAuth: CachedData<AdminUser> = {
      data: user,
      timestamp: Date.now(),
      ttl: this.CACHE_TTL.AUTH_SESSION
    };
    localStorage.setItem('auth-session', JSON.stringify(cachedAuth));
  }

  /**
   * Get cached auth session if valid, otherwise check Supabase
   */
  static async getAuthSession(): Promise<AdminUser | null> {
    // Check cache first
    const cached = localStorage.getItem('auth-session');
    if (cached) {
      try {
        const cachedAuth: CachedData<AdminUser> = JSON.parse(cached);
        const isExpired = (Date.now() - cachedAuth.timestamp) > cachedAuth.ttl;
        
        if (!isExpired) {
          return cachedAuth.data; // Return cached data
        }
      } catch (error) {
        console.warn('Invalid auth cache:', error);
      }
    }

    // Cache expired or invalid, check Supabase
    try {
      const user = await SupabaseService.getCurrentUser();
      if (user) {
        this.setAuthSession(user); // Update cache
      } else {
        localStorage.removeItem('auth-session'); // Clear invalid cache
      }
      return user;
    } catch (error) {
      console.error('Auth check failed:', error);
      return null;
    }
  }

  /**
   * Clear auth session from both cache and Supabase
   */
  static async clearAuthSession(): Promise<void> {
    localStorage.removeItem('auth-session');
    await SupabaseService.signOut();
  }

  // ===========================================
  // WEBSITE DATA MANAGEMENT
  // ===========================================

  /**
   * Get websites with smart caching strategy
   */
  static async getWebsites(userId: string, forceRefresh = false): Promise<GeneratedWebsite[]> {
    const cacheKey = `websites-${userId}`;
    
    // Check cache first (unless force refresh)
    if (!forceRefresh) {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        try {
          const cachedWebsites: CachedData<GeneratedWebsite[]> = JSON.parse(cached);
          const isExpired = (Date.now() - cachedWebsites.timestamp) > cachedWebsites.ttl;
          
          if (!isExpired) {
            return cachedWebsites.data; // Return cached data
          }
        } catch (error) {
          console.warn('Invalid websites cache:', error);
        }
      }
    }

    // Fetch from Supabase and update cache
    try {
      const websites = await SupabaseService.getGeneratedWebsites(userId);
      
      const cachedData: CachedData<GeneratedWebsite[]> = {
        data: websites,
        timestamp: Date.now(),
        ttl: this.CACHE_TTL.WEBSITES
      };
      localStorage.setItem(cacheKey, JSON.stringify(cachedData));
      
      return websites;
    } catch (error) {
      console.error('Failed to fetch websites:', error);
      // Return cached data if available, even if expired
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        try {
          const cachedWebsites: CachedData<GeneratedWebsite[]> = JSON.parse(cached);
          return cachedWebsites.data;
        } catch {}
      }
      return [];
    }
  }

  /**
   * Save website and update cache immediately
   */
  static async saveWebsite(websiteData: Omit<GeneratedWebsite, 'id' | 'created_at'>): Promise<GeneratedWebsite> {
    try {
      const newWebsite = await SupabaseService.saveGeneratedWebsite(websiteData);
      
      // Update cache immediately with new website
      const cacheKey = `websites-${websiteData.user_id}`;
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        try {
          const cachedWebsites: CachedData<GeneratedWebsite[]> = JSON.parse(cached);
          cachedWebsites.data.push(newWebsite);
          cachedWebsites.timestamp = Date.now(); // Update timestamp
          localStorage.setItem(cacheKey, JSON.stringify(cachedWebsites));
        } catch (error) {
          // If cache update fails, just clear it
          localStorage.removeItem(cacheKey);
        }
      }
      
      return newWebsite;
    } catch (error) {
      console.error('Failed to save website:', error);
      
      
      throw error;
    }
  }

  /**
   * Delete website and update cache
   */
  static async deleteWebsite(websiteId: string, userId: string): Promise<void> {
    try {
      await SupabaseService.deleteWebsite(websiteId);
      
      // Update cache immediately
      const cacheKey = `websites-${userId}`;
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        try {
          const cachedWebsites: CachedData<GeneratedWebsite[]> = JSON.parse(cached);
          cachedWebsites.data = cachedWebsites.data.filter(site => site.id !== websiteId);
          cachedWebsites.timestamp = Date.now();
          localStorage.setItem(cacheKey, JSON.stringify(cachedWebsites));
        } catch (error) {
          localStorage.removeItem(cacheKey);
        }
      }
    } catch (error) {
      console.error('Failed to delete website:', error);
      
      
      throw error;
    }
  }

  /**
   * Update website status and cache
   */
  static async updateWebsiteStatus(websiteId: string, userId: string, isActive: boolean): Promise<void> {
    try {
      await SupabaseService.updateWebsiteStatus(websiteId, isActive);
      
      // Update cache immediately
      const cacheKey = `websites-${userId}`;
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        try {
          const cachedWebsites: CachedData<GeneratedWebsite[]> = JSON.parse(cached);
          const index = cachedWebsites.data.findIndex(site => site.id === websiteId);
          if (index !== -1) {
            cachedWebsites.data[index].is_active = isActive;
            cachedWebsites.timestamp = Date.now();
            localStorage.setItem(cacheKey, JSON.stringify(cachedWebsites));
          }
        } catch (error) {
          localStorage.removeItem(cacheKey);
        }
      }
    } catch (error) {
      console.error('Failed to update website status:', error);
      
      
      throw error;
    }
  }

  // ===========================================
  // USER PREFERENCES (localStorage only)
  // ===========================================

  /**
   * Get user preferences from localStorage
   */
  static getUserPreferences(): UserPreferences {
    const stored = localStorage.getItem('user-preferences');
    const defaults: UserPreferences = {
      currentPage: 'dashboard',
      sidebarCollapsed: false,
      theme: 'light',
      lastVisited: new Date().toISOString()
    };

    if (!stored) return defaults;

    try {
      return { ...defaults, ...JSON.parse(stored) };
    } catch (error) {
      console.warn('Invalid user preferences:', error);
      return defaults;
    }
  }

  /**
   * Update user preferences
   */
  static setUserPreferences(preferences: Partial<UserPreferences>): void {
    const current = this.getUserPreferences();
    const updated = { ...current, ...preferences, lastVisited: new Date().toISOString() };
    localStorage.setItem('user-preferences', JSON.stringify(updated));
  }

  // ===========================================
  // TEMPORARY WORKFLOW DATA (sessionStorage)
  // ===========================================

  /**
   * Store extracted menu data during workflow
   */
  static setExtractedMenuData(data: any): void {
    sessionStorage.setItem('extracted-menu-data', JSON.stringify(data));
  }

  /**
   * Get extracted menu data
   */
  static getExtractedMenuData(): any {
    const stored = sessionStorage.getItem('extracted-menu-data');
    return stored ? JSON.parse(stored) : null;
  }

  /**
   * Clear workflow data
   */
  static clearExtractedMenuData(): void {
    sessionStorage.removeItem('extracted-menu-data');
  }

  // ===========================================
  // DASHBOARD STATS WITH SMART CACHING
  // ===========================================

  /**
   * Get dashboard stats with caching
   */
  static async getDashboardStats(userId: string, forceRefresh = false) {
    const cacheKey = `dashboard-stats-${userId}`;
    
    if (!forceRefresh) {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        try {
          const cachedStats: CachedData<any> = JSON.parse(cached);
          const isExpired = (Date.now() - cachedStats.timestamp) > cachedStats.ttl;
          
          if (!isExpired) {
            return cachedStats.data;
          }
        } catch (error) {
          console.warn('Invalid dashboard cache:', error);
        }
      }
    }

    // Fetch fresh data
    try {
      const stats = await SupabaseService.getDashboardStats(userId);
      
      const cachedData: CachedData<any> = {
        data: stats,
        timestamp: Date.now(),
        ttl: this.CACHE_TTL.DASHBOARD_STATS
      };
      localStorage.setItem(cacheKey, JSON.stringify(cachedData));
      
      return stats;
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
      
      // Return cached data if available
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        try {
          const cachedStats: CachedData<any> = JSON.parse(cached);
          return cachedStats.data;
        } catch {}
      }
      
      
      return null;
    }
  }

  // ===========================================
  // CACHE MANAGEMENT
  // ===========================================

  /**
   * Clear all caches for a user (logout, etc.)
   */
  static clearUserCaches(userId?: string): void {
    if (userId) {
      localStorage.removeItem(`websites-${userId}`);
      localStorage.removeItem(`dashboard-stats-${userId}`);
    }
    localStorage.removeItem('auth-session');
    sessionStorage.clear();
  }

  /**
   * Clear expired caches
   */
  static cleanExpiredCaches(): void {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.includes('websites-') || key.includes('dashboard-stats-') || key === 'auth-session') {
        try {
          const cached = localStorage.getItem(key);
          if (cached) {
            const data: CachedData<any> = JSON.parse(cached);
            const isExpired = (Date.now() - data.timestamp) > data.ttl;
            if (isExpired) {
              localStorage.removeItem(key);
            }
          }
        } catch (error) {
          // Invalid cache entry, remove it
          localStorage.removeItem(key);
        }
      }
    });
  }

  /**
   * Get cache info for debugging
   */
  static getCacheInfo() {
    const keys = Object.keys(localStorage);
    const cacheInfo = keys
      .filter(key => key.includes('websites-') || key.includes('dashboard-stats-') || key === 'auth-session')
      .map(key => {
        try {
          const cached = localStorage.getItem(key);
          if (cached) {
            const data: CachedData<any> = JSON.parse(cached);
            const isExpired = (Date.now() - data.timestamp) > data.ttl;
            return {
              key,
              size: new Blob([cached]).size,
              timestamp: new Date(data.timestamp).toISOString(),
              ttl: data.ttl,
              isExpired
            };
          }
        } catch {}
        return null;
      })
      .filter(Boolean);
    
    return cacheInfo;
  }
}

// Auto-cleanup expired caches on app start
StorageService.cleanExpiredCaches();