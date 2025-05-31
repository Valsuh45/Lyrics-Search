import axios, { AxiosResponse } from "axios";
import { SearchResponse, LyricsResponse, ApiError, Song } from "./types";

class ApiService {
  private readonly baseURL = "https://api.lyrics.ovh";
  private readonly corsProxy = "https://cors-anywhere.herokuapp.com/";

  /**
   * Search for songs by artist or song name
   */
  async searchSongs(query: string): Promise<SearchResponse> {
    try {
      const response: AxiosResponse<SearchResponse> = await axios.get(
        `${this.baseURL}/suggest/${encodeURIComponent(query)}`,
      );
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
   * Get more songs using pagination URL
   */
  async getMoreSongs(url: string): Promise<SearchResponse> {
    try {
      // Use CORS proxy for pagination URLs
      const proxyUrl = url.startsWith("http") ? `${this.corsProxy}${url}` : url;
      const response: AxiosResponse<SearchResponse> = await axios.get(proxyUrl);
      return response.data;
    } catch (error) {
      throw this.handleApiError(error, "Failed to load more songs");
    }
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
