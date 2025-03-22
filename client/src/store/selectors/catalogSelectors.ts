import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '../store';

export const selectCatalogState = (state: RootState) => state.catalog;
export const selectArtists = (state: RootState) => state.catalog.artists;
export const selectSongs = (state: RootState) => state.catalog.songs;
export const selectSelectedArtistId = (state: RootState) => state.catalog.selectedArtist;
export const selectSearchedArtist = (state: RootState) => state.catalog.searchedArtist;
export const selectDuration = (state: RootState) => state.catalog.duration;
export const selectPagination = (state: RootState) => state.catalog.pagination;
export const selectLoadingStates = (state: RootState) => state.catalog.loading;
export const selectError = (state: RootState) => state.catalog.error;

export const selectIsLoading = createSelector(
  selectLoadingStates,
  (loading) => loading.artists || loading.songs
);

export const selectCurrentPage = createSelector(
  selectPagination,
  (pagination) => pagination.currentPage
);

export const selectItemsPerPage = createSelector(
  selectPagination,
  (pagination) => pagination.itemsPerPage
);

export const selectTotalPages = createSelector(
  selectPagination,
  (pagination) => pagination.totalPages
);

export const selectSelectedArtist = createSelector(
  [selectArtists, selectSelectedArtistId],
  (artists, selectedId) => artists.find(artist => artist.id === selectedId) || null
);

export const selectPaginatedSongs = createSelector(
  [selectSongs, selectCurrentPage, selectItemsPerPage],
  (songs, currentPage, itemsPerPage) => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return songs.slice(startIndex, endIndex);
  }
);

export const selectFormattedDuration = createSelector(
  selectDuration,
  (duration) => {
    const { hours, minutes, seconds } = duration;
    
    const formattedHours = hours > 0 ? `${hours} ${hours === 1 ? 'hour' : 'hours'}` : '';
    const formattedMinutes = minutes > 0 ? `${minutes} ${minutes === 1 ? 'minute' : 'minutes'}` : '';
    const formattedSeconds = seconds > 0 ? `${seconds} ${seconds === 1 ? 'second' : 'seconds'}` : '';
    
    let formattedDuration = [formattedHours, formattedMinutes, formattedSeconds]
      .filter(Boolean)
      .join(' ');
      
    return formattedDuration || '0 seconds';
  }
); 