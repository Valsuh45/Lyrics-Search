// API Response Types
export interface Artist {
  id: number;
  name: string;
  link: string;
  picture: string;
  picture_small: string;
  picture_medium: string;
  picture_big: string;
  picture_xl: string;
  nb_album: number;
  nb_fan: number;
  radio: boolean;
  tracklist: string;
  type: string;
}

export interface Album {
  id: number;
  title: string;
  link: string;
  cover: string;
  cover_small: string;
  cover_medium: string;
  cover_big: string;
  cover_xl: string;
  md5_image: string;
  release_date: string;
  tracklist: string;
  type: string;
}

export interface Song {
  id: number;
  readable: boolean;
  title: string;
  title_short: string;
  title_version: string;
  link: string;
  duration: number;
  rank: number;
  explicit_lyrics: boolean;
  explicit_content_lyrics: number;
  explicit_content_cover: number;
  preview: string;
  md5_image: string;
  artist: Artist;
  album: Album;
  type: string;
}

export interface SearchResponse {
  data: Song[];
  total: number;
  next?: string;
  prev?: string;
}

export interface LyricsResponse {
  lyrics: string;
  error?: string;
}

// App State Types
export interface AppState {
  isLoading: boolean;
  searchTerm: string;
  searchResults: Song[];
  currentLyrics: LyricsData | null;
  currentPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  nextPageUrl?: string;
  prevPageUrl?: string;
  error: string | null;
}

export interface LyricsData {
  artist: string;
  title: string;
  lyrics: string;
}

// Popular Artists Data
export interface PopularArtist {
  name: string;
  image: string;
  searchTerm: string;
}

// Event Types
export type SearchEvent = CustomEvent<{ query: string }>;
export type LyricsEvent = CustomEvent<{ artist: string; title: string }>;
export type PageChangeEvent = CustomEvent<{ direction: 'next' | 'prev' }>;

// API Error Types
export interface ApiError {
  message: string;
  status?: number;
  code?: string;
}

// Component Props Types (for potential future React/Vue migration)
export interface SearchBarProps {
  onSearch: (query: string) => void;
  isLoading: boolean;
  placeholder?: string;
}

export interface SongListProps {
  songs: Song[];
  onGetLyrics: (artist: string, title: string) => void;
  isLoading: boolean;
}

export interface LyricsDisplayProps {
  lyricsData: LyricsData | null;
  onBack: () => void;
}

export interface PaginationProps {
  hasNext: boolean;
  hasPrev: boolean;
  onNext: () => void;
  onPrev: () => void;
  isLoading: boolean;
}

// Utility Types
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface AsyncResult<T> {
  data?: T;
  error?: ApiError;
  loading: boolean;
}