import { createAsyncThunk } from '@reduxjs/toolkit';
import { 
  searchVibeRequest, 
  searchVibeSuccess, 
  searchVibeFailure,
  generateYearOptions,
  selectYear,
  changeVibePage
} from '../slices/vibeSearchSlice';
import axios from 'axios';
import { VibeSong } from '../types';
import { API_BASE_URL } from '../../config.ts';

const API_URL = API_BASE_URL;

export const searchVibe = createAsyncThunk(
  'vibeSearch/searchVibe',
  async ({ query, artist, page = 1 }: { query: string; artist: string; page?: number }, { dispatch }) => {
    try {
      dispatch(searchVibeRequest({ query, artist }));
      
      const response = await axios.post(
        `${API_URL}/api/vibe_search`,
        { query, artist, page },
        { withCredentials: true }
      );
      
      const data = response.data;
      
      // Transform the API response to match our state structure
      const songs: VibeSong[] = data.relevant_songs.map((song: any, index: number) => ({
        id: `vibe-song-${index}`,
        title: song.title,
        artist: song.artist,
        year: song.year,
        url: song.url
      }));
      
      dispatch(searchVibeSuccess({
        songs,
        totalPages: data.total_pages,
        totalItems: data.total_results,
        currentPage: page
      }));
      
      dispatch(generateYearOptions());
      
      return {
        songs,
        totalPages: data.total_pages,
        totalItems: data.total_results,
        query,
        artist,
        currentPage: page
      };
    } catch (error) {
      console.error('Error searching for vibes:', error);
      let errorMessage = 'Failed to search for vibes';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      dispatch(searchVibeFailure(errorMessage));
      throw error;
    }
  }
);

export const filterSongsByYear = createAsyncThunk(
  'vibeSearch/filterSongsByYear',
  async (yearId: string, { dispatch }) => {
    dispatch(selectYear(yearId));
    return yearId;
  }
);

export const changeVibeSearchPage = createAsyncThunk(
  'vibeSearch/changeVibeSearchPage',
  async ({ page, query, artist }: { page: number; query: string; artist: string }, { dispatch }) => {
    dispatch(changeVibePage(page));
    
    return dispatch(searchVibe({ query, artist, page }));
  }
); 