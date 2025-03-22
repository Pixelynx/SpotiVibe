export interface Song {
  id: string;
  name: string;
  album: string;
  artist: string;
  duration: string;
  durationMs?: number;
  albumId?: string;
  artistId?: string;
  uri?: string;
  imageUrl?: string;
}

export interface Artist {
  id: string;
  name: string;
  external_urls?: {
    spotify?: string;
  };
  images?: Image[];
  isSelected?: boolean;
}

export interface Album {
  id: string;
  name: string;
  images: Image[];
  artistId: string;
  artistName: string;
}

// Image Type (for artist and album images)
export interface Image {
  url: string;
  height: number;
  width: number;
}

export interface CatalogState {
  selectedArtist: string;
  searchedArtist: string;
  originalArtist: string;
  artists: Artist[];
  songs: Song[];
  allSongs: Song[];
  duration: {
    hours: number;
    minutes: number;
    seconds: number;
  };
  pagination: {
    currentPage: number;
    totalPages: number;
    itemsPerPage: number;
    totalItems: number;
  };
  loading: {
    artists: boolean;
    songs: boolean;
  };
  error: string | null;
}

export interface RootState {
  catalog: CatalogState;
}

export enum CatalogActionTypes {
  FETCH_ARTISTS_REQUEST = 'catalog/FETCH_ARTISTS_REQUEST',
  FETCH_ARTISTS_SUCCESS = 'catalog/FETCH_ARTISTS_SUCCESS',
  FETCH_ARTISTS_FAILURE = 'catalog/FETCH_ARTISTS_FAILURE',
  
  FETCH_SONGS_REQUEST = 'catalog/FETCH_SONGS_REQUEST',
  FETCH_SONGS_SUCCESS = 'catalog/FETCH_SONGS_SUCCESS',
  FETCH_SONGS_FAILURE = 'catalog/FETCH_SONGS_FAILURE',
  
  SELECT_ARTIST = 'catalog/SELECT_ARTIST',
  SET_SEARCH_ARTIST = 'catalog/SET_SEARCH_ARTIST',
  
  SET_PAGINATION = 'catalog/SET_PAGINATION',
  CHANGE_PAGE = 'catalog/CHANGE_PAGE'
} 