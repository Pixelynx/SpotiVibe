import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { VibeSearchState, YearOption, VibeSong } from '../types';
import { extractYearFromDate } from '../../utils/dateUtils';

const initialState: VibeSearchState = {
  query: '',
  artist: '',
  songs: [],
  allSongs: [],
  yearOptions: [],
  selectedYear: 'year-all',
  isFiltered: false,
  filteredSongs: [],
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0
  },
  loading: false,
  error: null
};

const vibeSearchSlice = createSlice({
  name: 'vibeSearch',
  initialState,
  reducers: {
    searchVibeRequest: (state, action: PayloadAction<{ query: string; artist: string }>) => {
      state.loading = true;
      state.error = null;
      state.query = action.payload.query;
      state.artist = action.payload.artist;
    },
    searchVibeSuccess: (state, action: PayloadAction<{
      songs: VibeSong[];
      totalPages: number;
      totalItems: number;
      currentPage: number;
    }>) => {
      state.loading = false;
      state.songs = action.payload.songs;
      state.allSongs = action.payload.songs;
      state.pagination.totalPages = action.payload.totalPages;
      state.pagination.totalItems = action.payload.totalItems;
      state.pagination.currentPage = action.payload.currentPage;
      
      // Reset filtering when loading new results
      state.isFiltered = false;
      state.selectedYear = 'year-all';
    },
    searchVibeFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    setYearOptions: (state, action: PayloadAction<YearOption[]>) => {
      state.yearOptions = action.payload;
    },
    selectYear: (state, action: PayloadAction<string>) => {
      const yearId = action.payload;
      state.selectedYear = yearId;
      
      // Update yearOptions to reflect the new selection
      state.yearOptions = state.yearOptions.map(option => ({
        ...option,
        isSelected: option.id === yearId
      }));
      
      if (yearId === 'year-all') {
        state.isFiltered = false;
        state.filteredSongs = [];
      } else {
        const selectedYearValue = state.yearOptions.find(option => option.id === yearId)?.year;
        if (selectedYearValue) {
          state.isFiltered = true;
          
          state.filteredSongs = state.allSongs.filter(song => {
            if (!song.year) return false;
            
            const yearValue = extractYearFromDate(song.year);
            return yearValue === selectedYearValue;
          });
        }
      }
    },
    changeVibePage: (state, action: PayloadAction<number>) => {
      state.pagination.currentPage = action.payload;
      // Reset filtering when changing pages
      state.isFiltered = false;
      state.selectedYear = 'year-all';
      
      // Update yearOptions to reset selection
      state.yearOptions = state.yearOptions.map(option => ({
        ...option,
        isSelected: option.id === 'year-all'
      }));
    },
    generateYearOptions: (state) => {
      if (!state.allSongs || state.allSongs.length === 0) {
        state.yearOptions = [];
        return;
      }
      
      const uniqueYears = new Set<string>();
      state.allSongs.forEach(song => {
        if (song.year) {
          const yearOnly = extractYearFromDate(song.year);
          if (yearOnly) {
            uniqueYears.add(yearOnly);
          }
        }
      });
      
      const sortedYears = Array.from(uniqueYears).sort((a, b) => {
        return parseInt(a) - parseInt(b);
      });
      
      const yearOptions: YearOption[] = [
        { id: 'year-all', year: 'All Years', isSelected: true }
      ];
      
      sortedYears.forEach((year, index) => {
        yearOptions.push({
          id: `year-${index + 1}`,
          year,
          isSelected: false
        });
      });
      
      state.yearOptions = yearOptions;
    }
  }
});

export const {
  searchVibeRequest,
  searchVibeSuccess,
  searchVibeFailure,
  setYearOptions,
  selectYear,
  changeVibePage,
  generateYearOptions
} = vibeSearchSlice.actions;

export default vibeSearchSlice.reducer; 