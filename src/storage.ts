export class StorageManager {
  private readonly RECENT_SEARCHES_KEY = 'lyrics-search-recent';
  private readonly FAVORITES_KEY = 'lyrics-search-favorites';
  private readonly SETTINGS_KEY = 'lyrics-search-settings';
  private readonly MAX_RECENT_SEARCHES = 10;

  /**
   * Add a search term to recent searches
   */
  addRecentSearch(searchTerm: string): void {
    if (!searchTerm.trim()) return;

    const recentSearches = this.getRecentSearches();
    const normalizedTerm = searchTerm.toLowerCase().trim();
    
    // Remove if already exists
    const filtered = recentSearches.filter(
      term => term.toLowerCase() !== normalizedTerm
    );
    
    // Add to beginning
    filtered.unshift(searchTerm.trim());
    
    // Keep only max items
    const trimmed = filtered.slice(0, this.MAX_RECENT_SEARCHES);
    
    this.setItem(this.RECENT_SEARCHES_KEY, trimmed);
  }

  /**
   * Get recent searches
   */
  getRecentSearches(): string[] {
    return this.getItem<string[]>(this.RECENT_SEARCHES_KEY) || [];
  }

  /**
   * Clear recent searches
   */
  clearRecentSearches(): void {
    this.removeItem(this.RECENT_SEARCHES_KEY);
  }

  /**
   * Add a song to favorites
   */
  addFavorite(artist: string, title: string, lyrics: string): void {
    const favorites = this.getFavorites();
    const favorite = {
      id: Date.now().toString(),
      artist,
      title,
      lyrics,
      addedAt: new Date().toISOString()
    };

    // Check if already exists
    const exists = favorites.some(
      fav => fav.artist.toLowerCase() === artist.toLowerCase() && 
             fav.title.toLowerCase() === title.toLowerCase()
    );

    if (!exists) {
      favorites.unshift(favorite);
      this.setItem(this.FAVORITES_KEY, favorites);
    }
  }

  /**
   * Get favorite songs
   */
  getFavorites(): Array<{
    id: string;
    artist: string;
    title: string;
    lyrics: string;
    addedAt: string;
  }> {
    return this.getItem(this.FAVORITES_KEY) || [];
  }

  /**
   * Remove a favorite
   */
  removeFavorite(id: string): void {
    const favorites = this.getFavorites();
    const filtered = favorites.filter(fav => fav.id !== id);
    this.setItem(this.FAVORITES_KEY, filtered);
  }

  /**
   * Check if a song is favorited
   */
  isFavorite(artist: string, title: string): boolean {
    const favorites = this.getFavorites();
    return favorites.some(
      fav => fav.artist.toLowerCase() === artist.toLowerCase() && 
             fav.title.toLowerCase() === title.toLowerCase()
    );
  }

  /**
   * Save user settings
   */
  saveSettings(settings: {
    theme?: 'light' | 'dark';
    autoplay?: boolean;
    fontSize?: 'small' | 'medium' | 'large';
  }): void {
    const currentSettings = this.getSettings();
    const newSettings = { ...currentSettings, ...settings };
    this.setItem(this.SETTINGS_KEY, newSettings);
  }

  /**
   * Get user settings
   */
  getSettings(): {
    theme: 'light' | 'dark';
    autoplay: boolean;
    fontSize: 'small' | 'medium' | 'large';
  } {
    return this.getItem(this.SETTINGS_KEY) || {
      theme: 'light',
      autoplay: false,
      fontSize: 'medium'
    };
  }

  /**
   * Generic method to set item in localStorage
   */
  private setItem<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.warn('Failed to save to localStorage:', error);
    }
  }

  /**
   * Generic method to get item from localStorage
   */
  private getItem<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.warn('Failed to read from localStorage:', error);
      return null;
    }
  }

  /**
   * Remove item from localStorage
   */
  private removeItem(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.warn('Failed to remove from localStorage:', error);
    }
  }

  /**
   * Clear all app data
   */
  clearAllData(): void {
    this.removeItem(this.RECENT_SEARCHES_KEY);
    this.removeItem(this.FAVORITES_KEY);
    this.removeItem(this.SETTINGS_KEY);
  }

  /**
   * Get storage usage info
   */
  getStorageInfo(): {
    recentSearchesCount: number;
    favoritesCount: number;
    hasSettings: boolean;
  } {
    return {
      recentSearchesCount: this.getRecentSearches().length,
      favoritesCount: this.getFavorites().length,
      hasSettings: !!this.getItem(this.SETTINGS_KEY)
    };
  }
}