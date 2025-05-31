import { apiService } from "./api";
import { AppState, Song, LyricsData, PopularArtist, ApiError } from "./types";
import { UIManager } from "./ui";
import { StorageManager } from "./storage";

export class LyricsSearchApp {
  private state: AppState = {
    isLoading: false,
    searchTerm: "",
    searchResults: [],
    currentLyrics: null,
    currentPage: 1,
    hasNextPage: false,
    hasPrevPage: false,
    error: null,
  };

  private uiManager: UIManager;
  private storageManager: StorageManager;
  private popularArtists: PopularArtist[] = [
    { name: "Post Malone", image: "🎤", searchTerm: "post malone" },
    { name: "NF", image: "🎵", searchTerm: "nf" },
    { name: "Prinz", image: "👑", searchTerm: "prinz" },
    { name: "Dean Lewis", image: "🎸", searchTerm: "dean lewis" },
    { name: "Dax", image: "⚡", searchTerm: "dax" },
    { name: "Juice Wrld", image: "🌟", searchTerm: "juice wrld" },
  ];

  constructor() {
    this.uiManager = new UIManager();
    this.storageManager = new StorageManager();
    this.init();
  }

  private async init(): Promise<void> {
    try {
      await this.setupEventListeners();
      await this.loadRecentSearches();
      this.renderPopularArtists();
      this.checkApiHealth();
    } catch (error) {
      this.handleError(error as ApiError);
    }
  }

  private async setupEventListeners(): Promise<void> {
    // Search form submission
    document.addEventListener("search", (event: Event) => {
      const customEvent = event as CustomEvent<{ query: string }>;
      this.handleSearch(customEvent.detail.query);
    });

    // Get lyrics button clicks
    document.addEventListener("getLyrics", (event: Event) => {
      const customEvent = event as CustomEvent<{
        artist: string;
        title: string;
      }>;
      this.handleGetLyrics(customEvent.detail.artist, customEvent.detail.title);
    });

    // Pagination
    document.addEventListener("pageChange", (event: Event) => {
      const customEvent = event as CustomEvent<{
        url: string;
        direction: "next" | "prev";
      }>;
      this.handlePageChange(
        customEvent.detail.url,
        customEvent.detail.direction,
      );
    });

    // Popular artist clicks
    document.addEventListener("popularArtistClick", (event: Event) => {
      const customEvent = event as CustomEvent<{ searchTerm: string }>;
      this.handleSearch(customEvent.detail.searchTerm);
    });

    // Back to search
    document.addEventListener("backToSearch", () => {
      this.showSearchResults();
    });

    // Clear search
    document.addEventListener("clearSearch", () => {
      this.clearSearch();
    });

    // Clear recent searches
    document.addEventListener("clearRecentSearches", () => {
      this.clearRecentSearches();
    });
  }

  public async handleSearch(query: string): Promise<void> {
    if (!query.trim()) {
      this.setError("Please enter a search term");
      return;
    }

    this.updateState({
      isLoading: true,
      searchTerm: query,
      error: null,
      currentLyrics: null,
    });

    this.uiManager.showLoadingState();

    try {
      const response = await apiService.searchSongs(query);

      this.updateState({
        isLoading: false,
        searchResults: response.data,
        hasNextPage: !!response.next,
        hasPrevPage: !!response.prev,
        nextPageUrl: response.next,
        prevPageUrl: response.prev,
        currentPage: 1,
      });

      this.storageManager.addRecentSearch(query);
      this.uiManager.renderSearchResults(response.data, this.state);
    } catch (error) {
      this.handleError(error as ApiError);
    }
  }

  public async handleGetLyrics(artist: string, title: string): Promise<void> {
    this.updateState({
      isLoading: true,
      error: null,
    });

    this.uiManager.showLoadingState();

    try {
      const lyrics = await apiService.getLyrics(artist, title);

      const lyricsData: LyricsData = {
        artist,
        title,
        lyrics,
      };

      this.updateState({
        isLoading: false,
        currentLyrics: lyricsData,
      });

      this.uiManager.renderLyrics(lyricsData);
    } catch (error) {
      this.handleError(error as ApiError);
    }
  }

  public async handlePageChange(
    url: string,
    direction: "next" | "prev",
  ): Promise<void> {
    this.updateState({
      isLoading: true,
      error: null,
    });

    this.uiManager.showLoadingState();

    try {
      const response = await apiService.getMoreSongs(url);

      this.updateState({
        isLoading: false,
        searchResults: response.data,
        hasNextPage: !!response.next,
        hasPrevPage: !!response.prev,
        nextPageUrl: response.next,
        prevPageUrl: response.prev,
        currentPage:
          direction === "next"
            ? this.state.currentPage + 1
            : this.state.currentPage - 1,
      });

      this.uiManager.renderSearchResults(response.data, this.state);
    } catch (error) {
      this.handleError(error as ApiError);
    }
  }

  private showSearchResults(): void {
    this.updateState({
      currentLyrics: null,
    });

    if (this.state.searchResults.length > 0) {
      this.uiManager.renderSearchResults(this.state.searchResults, this.state);
    } else {
      this.uiManager.showWelcomeScreen();
      this.renderPopularArtists();
    }
  }

  private clearSearch(): void {
    this.updateState({
      searchTerm: "",
      searchResults: [],
      currentLyrics: null,
      currentPage: 1,
      hasNextPage: false,
      hasPrevPage: false,
      error: null,
    });

    this.uiManager.showWelcomeScreen();
    this.renderPopularArtists();
  }

  private renderPopularArtists(): void {
    this.uiManager.renderPopularArtists(this.popularArtists);
  }

  private async loadRecentSearches(): Promise<void> {
    const recentSearches = this.storageManager.getRecentSearches();
    this.uiManager.renderRecentSearches(recentSearches);
  }

  private updateState(newState: Partial<AppState>): void {
    this.state = { ...this.state, ...newState };
  }

  private setError(message: string): void {
    this.updateState({
      error: message,
      isLoading: false,
    });
    this.uiManager.showError(message);
  }

  private handleError(error: ApiError): void {
    console.error("App Error:", error);

    let errorMessage = "An unexpected error occurred";

    if (error.status === 404) {
      errorMessage = "No results found. Try a different search term.";
    } else if (error.status === 429) {
      errorMessage = "Too many requests. Please wait a moment and try again.";
    } else if (error.status && error.status >= 500) {
      errorMessage = "Server error. Please try again later.";
    } else if (error.message) {
      errorMessage = error.message;
    }

    this.setError(errorMessage);
  }

  private async checkApiHealth(): Promise<void> {
    try {
      const isHealthy = await apiService.healthCheck();
      if (!isHealthy) {
        this.uiManager.showApiWarning();
      }
    } catch (error) {
      console.warn("API health check failed:", error);
    }
  }

  // Public methods for external access
  public getState(): AppState {
    return { ...this.state };
  }

  public async searchByArtist(artistName: string): Promise<void> {
    await this.handleSearch(artistName);
  }

  public getCurrentLyrics(): LyricsData | null {
    return this.state.currentLyrics;
  }

  public getSearchResults(): Song[] {
    return this.state.searchResults;
  }

  private clearRecentSearches(): void {
    this.storageManager.clearRecentSearches();
    this.uiManager.renderRecentSearches([]);
    this.uiManager.showToast('Recent searches cleared!');
  }
}
