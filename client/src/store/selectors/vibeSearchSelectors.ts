import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '../types';

export const selectVibeSearchState = (state: RootState) => state.vibeSearch;

export const selectVibeQuery = createSelector(
  [selectVibeSearchState],
  (vibeSearch) => vibeSearch.query
);

export const selectVibeArtist = createSelector(
  [selectVibeSearchState],
  (vibeSearch) => vibeSearch.artist
);

export const selectVibeSongs = createSelector(
  [selectVibeSearchState],
  (vibeSearch) => vibeSearch.songs
);

export const selectAllVibeSongs = createSelector(
  [selectVibeSearchState],
  (vibeSearch) => vibeSearch.allSongs
);

export const selectFilteredVibeSongs = createSelector(
  [selectVibeSearchState],
  (vibeSearch) => vibeSearch.isFiltered ? vibeSearch.filteredSongs : vibeSearch.songs
);

export const selectYearOptions = createSelector(
  [selectVibeSearchState],
  (vibeSearch) => vibeSearch.yearOptions
);

export const selectSelectedYear = createSelector(
  [selectVibeSearchState],
  (vibeSearch) => vibeSearch.selectedYear
);

export const selectIsFiltered = createSelector(
  [selectVibeSearchState],
  (vibeSearch) => vibeSearch.isFiltered
);

export const selectVibeCurrentPage = createSelector(
  [selectVibeSearchState],
  (vibeSearch) => vibeSearch.pagination.currentPage
);

export const selectVibeTotalPages = createSelector(
  [selectVibeSearchState],
  (vibeSearch) => vibeSearch.pagination.totalPages
);

export const selectVibeTotalItems = createSelector(
  [selectVibeSearchState],
  (vibeSearch) => vibeSearch.pagination.totalItems
);

export const selectVibeLoading = createSelector(
  [selectVibeSearchState],
  (vibeSearch) => vibeSearch.loading
);

export const selectVibeError = createSelector(
  [selectVibeSearchState],
  (vibeSearch) => vibeSearch.error
);

// Combined selectors
export const selectVibeSearchResults = createSelector(
  [selectFilteredVibeSongs, selectVibeQuery, selectVibeTotalItems, selectVibeTotalPages, selectVibeCurrentPage, selectIsFiltered],
  (songs, query, totalItems, totalPages, currentPage, isFiltered) => ({
    songs,
    query,
    totalItems,
    totalPages,
    currentPage,
    isFiltered
  })
);

export const selectVibeSearchPagination = createSelector(
  [selectVibeCurrentPage, selectVibeTotalPages, selectVibeTotalItems],
  (currentPage, totalPages, totalItems) => ({
    currentPage,
    totalPages,
    totalItems
  })
); 