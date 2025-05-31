import { Song, LyricsData, PopularArtist, AppState } from './types';

export class UIManager {
  private searchForm!: HTMLFormElement;
  private searchInput!: HTMLInputElement;
  private searchButton!: HTMLButtonElement;
  private resultContainer!: HTMLElement;
  private loadingSpinner!: HTMLElement;
  private errorContainer!: HTMLElement;
  private popularArtistsContainer!: HTMLElement;
  private recentSearchesContainer!: HTMLElement;
  private favoritesModal!: HTMLElement;
  private favoritesList!: HTMLElement;

  constructor() {
    this.initializeElements();
    this.setupEventListeners();
  }

  private initializeElements(): void {
    this.searchForm = this.getElement('#search-form') as HTMLFormElement;
    this.searchInput = this.getElement('#search-input') as HTMLInputElement;
    this.searchButton = this.getElement('#search-button') as HTMLButtonElement;
    this.resultContainer = this.getElement('#result-container');
    this.loadingSpinner = this.getElement('#loading-spinner');
    this.errorContainer = this.getElement('#error-container');
    this.popularArtistsContainer = this.getElement('#popular-artists');
    this.recentSearchesContainer = this.getElement('#recent-searches');
    this.favoritesModal = this.getElement('#favorites-modal');
    this.favoritesList = this.getElement('#favorites-list');
  }

  private getElement(selector: string): HTMLElement {
    const element = document.querySelector(selector) as HTMLElement;
    if (!element) {
      console.warn(`Element not found: ${selector}`);
      // Create a dummy element to prevent errors
      const dummy = document.createElement('div');
      dummy.style.display = 'none';
      document.body.appendChild(dummy);
      return dummy;
    }
    return element;
  }

  private setupEventListeners(): void {
    this.searchForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const query = this.searchInput.value.trim();
      if (query) {
        this.dispatchCustomEvent('search', { query });
      }
    });

    this.searchInput.addEventListener('input', (e) => {
      const target = e.target as HTMLInputElement;
      if (target.value.length > 2) {
        this.showSearchSuggestions(target.value);
      }
    });

    this.searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.clearSearch();
      }
    });

    // Favorites button
    const favoritesBtn = document.getElementById('favorites-btn');
    if (favoritesBtn) {
      favoritesBtn.addEventListener('click', () => {
        this.showFavoritesModal();
      });
    }

    // Modal close buttons
    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      if (target.classList.contains('modal-close') || target.closest('.modal-close')) {
        this.closeAllModals();
      }
      if (target.classList.contains('modal') && !target.closest('.modal-content')) {
        this.closeAllModals();
      }
    });
  }

  public renderSearchResults(songs: Song[], state: AppState): void {
    this.hideError();
    this.hideLoading();

    // Hide popular artists when showing search results
    this.hidePopularArtists();

    if (songs.length === 0) {
      this.showNoResults();
      return;
    }

    const html = `
      <div class="search-results">
        <div class="results-header">
          <h2>Search Results for "${state.searchTerm}"</h2>
          <span class="results-count">${songs.length} songs found</span>
        </div>
        <ul class="songs-list">
          ${songs.map(song => this.renderSongItem(song)).join('')}
        </ul>
        ${this.renderPagination(state)}
      </div>
    `;

    this.resultContainer.innerHTML = html;
    this.attachSongListeners();
    this.attachPaginationListeners();
  }

  private renderSongItem(song: Song): string {
    const duration = this.formatDuration(song.duration);
    
    return `
      <li class="song-item" data-song-id="${song.id}">
        <div class="song-info">
          <div class="album-cover-container">
            <div class="album-cover-placeholder">
              <i class="music-icon">🎵</i>
            </div>
          </div>
          <div class="song-details">
            <div class="song-title">${this.escapeHtml(song.title)}</div>
            <div class="artist-name">${this.escapeHtml(song.artist.name)}</div>
            <div class="song-meta">
              ${song.album?.title ? `<span class="album">${this.escapeHtml(song.album.title)}</span>` : ''}
              ${duration ? `<span class="duration">${duration}</span>` : ''}
            </div>
          </div>
        </div>
        <div class="song-actions">
          <button class="btn btn-primary get-lyrics-btn" 
                  data-artist="${this.escapeHtml(song.artist.name)}" 
                  data-title="${this.escapeHtml(song.title)}">
            <i class="icon-lyrics">📝</i>
            Get Lyrics
          </button>
        </div>
      </li>
    `;
  }

  private renderPagination(state: AppState): string {
    if (!state.hasNextPage && !state.hasPrevPage) {
      return '';
    }

    return `
      <div class="pagination">
        <button class="btn btn-secondary pagination-btn" 
                data-action="prev" 
                data-url="${state.prevPageUrl || ''}"
                ${!state.hasPrevPage ? 'disabled' : ''}>
          <i class="icon-prev">◀️</i> Previous
        </button>
        <span class="page-info">Page ${state.currentPage}</span>
        <button class="btn btn-secondary pagination-btn" 
                data-action="next" 
                data-url="${state.nextPageUrl || ''}"
                ${!state.hasNextPage ? 'disabled' : ''}>
          Next <i class="icon-next">▶️</i>
        </button>
      </div>
    `;
  }

  public renderLyrics(lyricsData: LyricsData): void {
    this.hideError();
    this.hideLoading();

    const formattedLyrics = lyricsData.lyrics.replace(/\n/g, '<br>');

    const html = `
      <div class="lyrics-display">
        <div class="lyrics-header">
          <button class="btn btn-secondary back-btn">
            <i class="icon-back">◀️</i> Back to Results
          </button>
          <div class="song-info">
            <h2 class="lyrics-title">${this.escapeHtml(lyricsData.title)}</h2>
            <h3 class="lyrics-artist">by ${this.escapeHtml(lyricsData.artist)}</h3>
          </div>
          <div class="lyrics-actions">
            <button class="btn btn-secondary favorite-btn" 
                    data-artist="${this.escapeHtml(lyricsData.artist)}" 
                    data-title="${this.escapeHtml(lyricsData.title)}">
              <i class="icon-favorite">❤️</i> Favorite
            </button>
            <button class="btn btn-secondary copy-btn">
              <i class="icon-copy">📋</i> Copy
            </button>
          </div>
        </div>
        <div class="lyrics-content">
          <p class="lyrics-text">${formattedLyrics}</p>
        </div>
      </div>
    `;

    this.resultContainer.innerHTML = html;
    this.attachLyricsListeners();
  }

  public renderPopularArtists(artists: PopularArtist[]): void {
    if (!this.popularArtistsContainer || this.popularArtistsContainer.style.display === 'none') {
      return;
    }

    const html = `
      <div class="popular-artists">
        <h3>Popular Artists</h3>
        <div class="artists-grid">
          ${artists.map(artist => `
            <button class="artist-card" data-search="${artist.searchTerm}">
              <span class="artist-icon">${artist.image}</span>
              <span class="artist-name">${this.escapeHtml(artist.name)}</span>
            </button>
          `).join('')}
        </div>
      </div>
    `;

    this.popularArtistsContainer.innerHTML = html;
    this.attachPopularArtistListeners();
  }

  public renderRecentSearches(searches: string[]): void {
    if (!this.recentSearchesContainer || this.recentSearchesContainer.style.display === 'none') {
      return;
    }

    if (searches.length === 0) {
      this.recentSearchesContainer.innerHTML = '';
      return;
    }

    const html = `
      <div class="recent-searches">
        <h3>Recent Searches</h3>
        <div class="recent-list">
          ${searches.map(search => `
            <button class="recent-item" data-search="${this.escapeHtml(search)}">
              <i class="icon-recent">🕒</i>
              ${this.escapeHtml(search)}
            </button>
          `).join('')}
        </div>
        <button class="btn btn-text clear-recent-btn">Clear All</button>
      </div>
    `;

    this.recentSearchesContainer.innerHTML = html;
    this.attachRecentSearchListeners();
  }

  public showLoadingState(): void {
    this.hideError();
    this.loadingSpinner.classList.remove('hidden');
    this.searchButton.disabled = true;
    this.searchButton.innerHTML = '<i class="spinner">⏳</i> Searching...';
  }

  public hideLoading(): void {
    this.loadingSpinner.classList.add('hidden');
    this.searchButton.disabled = false;
    this.searchButton.innerHTML = '<i class="icon-search">🔍</i> Search';
  }

  public showError(message: string): void {
    this.hideLoading();
    this.errorContainer.innerHTML = `
      <div class="error-message">
        <i class="icon-error">⚠️</i>
        <span>${this.escapeHtml(message)}</span>
        <button class="btn btn-text dismiss-error">×</button>
      </div>
    `;
    this.errorContainer.classList.remove('hidden');
    
    // Auto-hide error after 5 seconds
    setTimeout(() => this.hideError(), 5000);
  }

  public hideError(): void {
    this.errorContainer.classList.add('hidden');
    this.errorContainer.innerHTML = '';
  }

  public showNoResults(): void {
    // Hide popular artists when showing no results
    this.hidePopularArtists();

    this.resultContainer.innerHTML = `
      <div class="no-results">
        <i class="icon-no-results">🔍</i>
        <h3>No results found</h3>
        <p>Try different keywords or check the spelling</p>
        <button class="btn btn-primary" onclick="document.getElementById('search-input').focus()">
          Try Another Search
        </button>
      </div>
    `;
  }

  public showWelcomeScreen(): void {
    this.resultContainer.innerHTML = `
      <div class="welcome-screen">
        <h2>🎵 Find Your Favorite Lyrics</h2>
        <p>Search for any song or artist to get started</p>
      </div>
    `;
    
    // Show popular artists when returning to welcome screen
    this.showPopularArtists();
  }

  public showApiWarning(): void {
    const warningHtml = `
      <div class="api-warning">
        <i class="icon-warning">⚠️</i>
        <span>API service may be slow. Please be patient with requests.</span>
      </div>
    `;
    document.body.insertAdjacentHTML('afterbegin', warningHtml);
  }

  private showSearchSuggestions(query: string): void {
    // This could be enhanced with actual suggestion API
    const suggestions = this.getMockSuggestions(query);
    if (suggestions.length === 0) return;

    const existingSuggestions = document.querySelector('.search-suggestions');
    if (existingSuggestions) {
      existingSuggestions.remove();
    }

    const suggestionsHtml = `
      <div class="search-suggestions">
        ${suggestions.map(suggestion => `
          <button class="suggestion-item" data-suggestion="${this.escapeHtml(suggestion)}">
            ${this.escapeHtml(suggestion)}
          </button>
        `).join('')}
      </div>
    `;

    this.searchForm.insertAdjacentHTML('afterend', suggestionsHtml);
    this.attachSuggestionListeners();
  }

  private getMockSuggestions(query: string): string[] {
    const mockSuggestions = [
      'Beatles', 'Queen', 'Michael Jackson', 'Madonna', 'Elvis Presley',
      'Bob Dylan', 'Led Zeppelin', 'Pink Floyd', 'Rolling Stones', 'David Bowie'
    ];
    
    return mockSuggestions.filter(artist => 
      artist.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 5);
  }

  private attachSongListeners(): void {
    document.querySelectorAll('.get-lyrics-btn').forEach(button => {
      button.addEventListener('click', (e) => {
        const target = e.target as HTMLButtonElement;
        const artist = target.getAttribute('data-artist')!;
        const title = target.getAttribute('data-title')!;
        this.dispatchCustomEvent('getLyrics', { artist, title });
      });
    });


  }

  private attachPaginationListeners(): void {
    document.querySelectorAll('.pagination-btn').forEach(button => {
      button.addEventListener('click', (e) => {
        const target = e.currentTarget as HTMLButtonElement;
        const direction = target.getAttribute('data-action') as 'next' | 'prev';
        // We no longer need the URL parameter for client-side pagination
        this.dispatchCustomEvent('pageChange', { url: '', direction });
      });
    });
  }

  private attachLyricsListeners(): void {
    const backBtn = document.querySelector('.back-btn');
    if (backBtn) {
      backBtn.addEventListener('click', () => {
        this.dispatchCustomEvent('backToSearch', {});
      });
    }

    const copyBtn = document.querySelector('.copy-btn');
    if (copyBtn) {
      copyBtn.addEventListener('click', () => {
        this.copyLyricsToClipboard();
      });
    }

    const favoriteBtn = document.querySelector('.favorite-btn');
    if (favoriteBtn) {
      favoriteBtn.addEventListener('click', (e) => {
        const target = e.target as HTMLButtonElement;
        const artist = target.getAttribute('data-artist')!;
        const title = target.getAttribute('data-title')!;
        this.toggleFavorite(artist, title);
      });
    }
  }

  private attachPopularArtistListeners(): void {
    document.querySelectorAll('.artist-card').forEach(card => {
      card.addEventListener('click', (e) => {
        const target = e.target as HTMLButtonElement;
        const searchTerm = target.getAttribute('data-search')!;
        this.dispatchCustomEvent('popularArtistClick', { searchTerm });
      });
    });
  }

  private attachRecentSearchListeners(): void {
    document.querySelectorAll('.recent-item').forEach(item => {
      item.addEventListener('click', (e) => {
        const target = e.target as HTMLButtonElement;
        const search = target.getAttribute('data-search')!;
        this.searchInput.value = search;
        this.dispatchCustomEvent('search', { query: search });
      });
    });

    const clearBtn = document.querySelector('.clear-recent-btn');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        this.dispatchCustomEvent('clearRecentSearches', {});
      });
    }
  }

  private attachSuggestionListeners(): void {
    document.querySelectorAll('.suggestion-item').forEach(item => {
      item.addEventListener('click', (e) => {
        const target = e.target as HTMLButtonElement;
        const suggestion = target.getAttribute('data-suggestion')!;
        this.searchInput.value = suggestion;
        this.dispatchCustomEvent('search', { query: suggestion });
        document.querySelector('.search-suggestions')?.remove();
      });
    });
  }

  private clearSearch(): void {
    this.searchInput.value = '';
    document.querySelector('.search-suggestions')?.remove();
    this.dispatchCustomEvent('clearSearch', {});
  }



  private copyLyricsToClipboard(): void {
    const lyricsText = document.querySelector('.lyrics-text')?.textContent;
    if (lyricsText) {
      navigator.clipboard.writeText(lyricsText).then(() => {
        this.showToast('Lyrics copied to clipboard!');
      }).catch(() => {
        this.showToast('Failed to copy lyrics', 'error');
      });
    }
  }

  private toggleFavorite(artist: string, title: string): void {
    // Import storage manager functionality
    const storageManager = new (window as any).StorageManager();
    
    if (storageManager.isFavorite(artist, title)) {
      // Remove from favorites
      const favorites = storageManager.getFavorites();
      const favoriteToRemove = favorites.find((fav: any) => 
        fav.artist.toLowerCase() === artist.toLowerCase() && 
        fav.title.toLowerCase() === title.toLowerCase()
      );
      if (favoriteToRemove) {
        storageManager.removeFavorite(favoriteToRemove.id);
        this.showToast('Removed from favorites!');
      }
    } else {
      // Add to favorites
      const lyricsText = document.querySelector('.lyrics-text')?.textContent || '';
      storageManager.addFavorite(artist, title, lyricsText);
      this.showToast('Added to favorites!');
    }
    
    // Update favorite button state
    this.updateFavoriteButton(artist, title);
  }

  private updateFavoriteButton(artist: string, title: string): void {
    const storageManager = new (window as any).StorageManager();
    const favoriteBtn = document.querySelector('.favorite-btn') as HTMLButtonElement;
    
    if (favoriteBtn) {
      const isFavorite = storageManager.isFavorite(artist, title);
      favoriteBtn.innerHTML = isFavorite 
        ? '<i class="icon-favorite">💖</i> Favorited'
        : '<i class="icon-favorite">❤️</i> Favorite';
    }
  }

  public showFavoritesModal(): void {
    const storageManager = new (window as any).StorageManager();
    const favorites = storageManager.getFavorites();
    
    if (favorites.length === 0) {
      this.favoritesList.innerHTML = `
        <div class="empty-favorites">
          <p>No favorites yet!</p>
          <p>Add songs to your favorites by clicking the ❤️ button when viewing lyrics.</p>
        </div>
      `;
    } else {
      this.favoritesList.innerHTML = `
        <div class="favorites-grid">
          ${favorites.map((fav: any) => `
            <div class="favorite-item" data-favorite-id="${fav.id}">
              <div class="favorite-info">
                <div class="favorite-title">${this.escapeHtml(fav.title)}</div>
                <div class="favorite-artist">${this.escapeHtml(fav.artist)}</div>
                <div class="favorite-date">Added: ${new Date(fav.addedAt).toLocaleDateString()}</div>
              </div>
              <div class="favorite-actions">
                <button class="btn btn-primary view-lyrics-btn" 
                        data-artist="${this.escapeHtml(fav.artist)}"
                        data-title="${this.escapeHtml(fav.title)}">
                  View Lyrics
                </button>
                <button class="btn btn-secondary remove-favorite-btn" 
                        data-favorite-id="${fav.id}">
                  Remove
                </button>
              </div>
            </div>
          `).join('')}
        </div>
      `;
      
      // Attach event listeners for favorite actions
      this.attachFavoriteListeners();
    }
    
    this.favoritesModal.classList.remove('hidden');
  }

  private attachFavoriteListeners(): void {
    // View lyrics buttons
    document.querySelectorAll('.view-lyrics-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const target = e.target as HTMLButtonElement;
        const artist = target.getAttribute('data-artist')!;
        const title = target.getAttribute('data-title')!;
        this.closeAllModals();
        this.dispatchCustomEvent('getLyrics', { artist, title });
      });
    });

    // Remove favorite buttons
    document.querySelectorAll('.remove-favorite-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const target = e.target as HTMLButtonElement;
        const favoriteId = target.getAttribute('data-favorite-id')!;
        const storageManager = new (window as any).StorageManager();
        storageManager.removeFavorite(favoriteId);
        this.showFavoritesModal(); // Refresh the modal
        this.showToast('Favorite removed!');
      });
    });
  }

  private closeAllModals(): void {
    document.querySelectorAll('.modal').forEach(modal => {
      modal.classList.add('hidden');
    });
  }

  public showToast(message: string, type: 'success' | 'error' = 'success'): void {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.classList.add('show');
    }, 100);

    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  private formatDuration(seconds: number): string {
    if (!seconds) return '';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  private escapeHtml(unsafe: string): string {
    return unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  private dispatchCustomEvent(eventName: string, detail: any): void {
    const event = new CustomEvent(eventName, { detail });
    document.dispatchEvent(event);
  }

  public focusSearchInput(): void {
    this.searchInput.focus();
  }

  public setSearchValue(value: string): void {
    this.searchInput.value = value;
  }

  private hidePopularArtists(): void {
    const popularArtistsContainer = document.getElementById('popular-artists');
    if (popularArtistsContainer) {
      popularArtistsContainer.style.display = 'none';
    }
  }

  private showPopularArtists(): void {
    const popularArtistsContainer = document.getElementById('popular-artists');
    if (popularArtistsContainer) {
      popularArtistsContainer.style.display = 'block';
    }
  }
}