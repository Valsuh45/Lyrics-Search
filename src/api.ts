import axios, { AxiosResponse } from "axios";
import { SearchResponse, LyricsResponse, ApiError, Song } from "./types";

class ApiService {
  private readonly baseURL = "https://api.lyrics.ovh";
  private searchCache: Map<string, Song[]> = new Map();
  private readonly pageSize = 25;

  /**
   * Clear search cache
   */
  clearCache(): void {
    this.searchCache.clear();
  }

  /**
   * Search for songs by artist or song name
   */
  async searchSongs(query: string, page: number = 1): Promise<SearchResponse> {
    try {
      const cacheKey = query.toLowerCase();
      
      // If we have cached results, use client-side pagination
      if (this.searchCache.has(cacheKey)) {
        const allResults = this.searchCache.get(cacheKey)!;
        return this.paginateResults(allResults, page, query);
      }

      const response: AxiosResponse<SearchResponse> = await axios.get(
        `${this.baseURL}/suggest/${encodeURIComponent(query)}`,
      );
      
      // Cache all results for client-side pagination
      if (response.data.data) {
        this.searchCache.set(cacheKey, response.data.data);
        return this.paginateResults(response.data.data, page, query);
      }
      
      return response.data;
    } catch (error) {
      throw this.handleApiError(error, "Failed to search songs");
    }
  }

  /**
   * Get lyrics for a specific song
   */
  async getLyrics(artist: string, title: string): Promise<string> {
    try {
      const response: AxiosResponse<LyricsResponse> = await axios.get(
        `${this.baseURL}/v1/${encodeURIComponent(artist)}/${encodeURIComponent(title)}`,
      );

      if (response.data.error) {
        throw new Error(response.data.error);
      }

      return response.data.lyrics || "Lyrics not found";
    } catch (error) {
      throw this.handleApiError(error, "Failed to fetch lyrics");
    }
  }

  /**
   * Get more songs using pagination (client-side implementation)
   */
  async getMoreSongs(searchTerm: string, page: number): Promise<SearchResponse> {
    try {
      return await this.searchSongs(searchTerm, page);
    } catch (error) {
      throw this.handleApiError(error, "Failed to load more songs");
    }
  }

  /**
   * Client-side pagination helper
   */
  private paginateResults(allResults: Song[], page: number, searchTerm: string): SearchResponse {
    const startIndex = (page - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    const paginatedResults = allResults.slice(startIndex, endIndex);
    
    const hasNext = endIndex < allResults.length;
    const hasPrev = page > 1;
    
    return {
      data: paginatedResults,
      total: allResults.length,
      next: hasNext ? `page=${page + 1}&q=${encodeURIComponent(searchTerm)}` : undefined,
      prev: hasPrev ? `page=${page - 1}&q=${encodeURIComponent(searchTerm)}` : undefined
    };
  }

  /**
   * Search for songs by a specific artist
   */
  async searchByArtist(artistName: string): Promise<Song[]> {
    try {
      const searchResponse = await this.searchSongs(artistName);
      // Filter results to prioritize exact artist matches
      return searchResponse.data.filter((song) =>
        song.artist.name.toLowerCase().includes(artistName.toLowerCase()),
      );
    } catch (error) {
      throw this.handleApiError(error, "Failed to search by artist");
    }
  }

  /**
   * Get popular songs (simulated - you could enhance this with a real trending API)
   */
  async getPopularSongs(): Promise<Song[]> {
    const popularQueries = [
      "Beatles",
      "Queen",
      "Michael Jackson",
      "Post Malone",
      "NF",
    ];
    try {
      const randomQuery =
        popularQueries[Math.floor(Math.random() * popularQueries.length)];
      const response = await this.searchSongs(randomQuery);
      return response.data.slice(0, 5); // Return top 5
    } catch (error) {
      console.warn("Failed to fetch popular songs:", error);
      return [];
    }
  }

  /**
   * Handle API errors and convert to standardized format
   */
  private handleApiError(error: any, defaultMessage: string): ApiError {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const message =
        error.response?.data?.message || error.message || defaultMessage;

      return {
        message,
        status,
        code: error.code,
      };
    }

    if (error instanceof Error) {
      return {
        message: error.message || defaultMessage,
        code: "UNKNOWN_ERROR",
      };
    }

    return {
      message: defaultMessage,
      code: "UNKNOWN_ERROR",
    };
  }

  /**
   * Check if the API is available
   */
  async healthCheck(): Promise<boolean> {
    try {
      await axios.get(`${this.baseURL}/suggest/test`, { timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }
}

// Export singleton instance
export const apiService = new ApiService();
export default apiService;
