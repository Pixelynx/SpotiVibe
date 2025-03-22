import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CatalogState, Artist, Song } from '../types';

const initialState: CatalogState = {
  selectedArtist: '',
  searchedArtist: '',
  artists: [],
  songs: [],
  duration: {
    hours: 0,
    minutes: 0,
    seconds: 0
  },
  pagination: {
    currentPage: 1,
    totalPages: 1,
    itemsPerPage: 15,
    totalItems: 0
  },
  loading: {
    artists: false,
    songs: false
  },
  error: null
};

export const catalogSlice = createSlice({
  name: 'catalog',
  initialState,
  reducers: {
    // Artist fetching reducers
    fetchArtistsRequest: (state) => {
      state.loading.artists = true;
      state.error = null;
    },
    fetchArtistsSuccess: (state, action: PayloadAction<Artist[]>) => {
      state.artists = action.payload;
      state.loading.artists = false;
      
      // If no artist is selected yet, select the first one
      if (state.selectedArtist === '' && action.payload.length > 0) {
        state.selectedArtist = action.payload[0].id;
      }
    },
    fetchArtistsFailure: (state, action: PayloadAction<string>) => {
      state.loading.artists = false;
      state.error = action.payload;
    },
    
    // Songs fetching reducers
    fetchSongsRequest: (state) => {
      state.loading.songs = true;
      state.error = null;
    },
    fetchSongsSuccess: (state, action: PayloadAction<{ 
      songs: Song[],
      duration: { hours: number, minutes: number, seconds: number },
      totalItems: number
    }>) => {
      state.songs = action.payload.songs;
      state.duration = action.payload.duration;
      state.pagination.totalItems = action.payload.totalItems;
      state.pagination.totalPages = Math.ceil(
        action.payload.totalItems / state.pagination.itemsPerPage
      );
      state.loading.songs = false;
    },
    fetchSongsFailure: (state, action: PayloadAction<string>) => {
      state.loading.songs = false;
      state.error = action.payload;
    },
    
    // Artist selection
    selectArtist: (state, action: PayloadAction<string>) => {
      state.selectedArtist = action.payload;
      
      // Mark the selected artist in the artists array
      state.artists = state.artists.map(artist => ({
        ...artist,
        isSelected: artist.id === action.payload
      }));
      
      // Reset to page 1 when changing artists
      state.pagination.currentPage = 1;
    },
    
    setSearchArtist: (state, action: PayloadAction<string>) => {
      state.searchedArtist = action.payload;
    },
    
    changePage: (state, action: PayloadAction<number>) => {
      state.pagination.currentPage = action.payload;
    },
    
    setPagination: (state, action: PayloadAction<{
      itemsPerPage?: number;
      currentPage?: number;
    }>) => {
      if (action.payload.itemsPerPage) {
        state.pagination.itemsPerPage = action.payload.itemsPerPage;
        state.pagination.totalPages = Math.ceil(
          state.pagination.totalItems / action.payload.itemsPerPage
        );
      }
      
      if (action.payload.currentPage) {
        state.pagination.currentPage = action.payload.currentPage;
      }
    }
  }
});

export const {
  fetchArtistsRequest,
  fetchArtistsSuccess,
  fetchArtistsFailure,
  fetchSongsRequest,
  fetchSongsSuccess,
  fetchSongsFailure,
  selectArtist,
  setSearchArtist,
  changePage,
  setPagination
} = catalogSlice.actions;

export default catalogSlice.reducer; 