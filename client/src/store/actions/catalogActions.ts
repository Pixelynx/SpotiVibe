import { createAsyncThunk } from '@reduxjs/toolkit';
import { 
  fetchArtistsRequest, 
  fetchArtistsSuccess, 
  fetchArtistsFailure,
  fetchSongsRequest,
  fetchSongsSuccess,
  fetchSongsFailure,
  selectArtist
} from '../slices/catalogSlice';
import axios from 'axios';
import { Artist, Song } from '../types';

const API_URL = process.env.REACT_APP_BASE_URL;

export const fetchArtists = createAsyncThunk(
  'catalog/fetchArtists',
  async (_, { dispatch }) => {
    try {
      dispatch(fetchArtistsRequest());
      
      const response = await axios.get<Artist[]>(`${API_URL}/api/artists`);
      
      dispatch(fetchArtistsSuccess(response.data));
      
      // If there are artists, select the first one and fetch its songs
      if (response.data.length > 0) {
        dispatch(selectArtist(response.data[0].id));
        dispatch(fetchSongs(response.data[0].id));
      }
      
      return response.data;
    } catch (error) {
      let errorMessage = 'Failed to fetch artists';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      dispatch(fetchArtistsFailure(errorMessage));
      throw error;
    }
  }
);

export const fetchSongs = createAsyncThunk(
  'catalog/fetchSongs',
  async (artistId: string, { dispatch, getState }) => {
    try {
      dispatch(fetchSongsRequest());
      
      // Get duration from the UI
      const state = getState() as any;
      const { hours = 0, minutes = 0, seconds = 0 } = state?.catalog?.duration || {};
      
      const totalDuration = (hours * 3600) + (minutes * 60) + seconds;
      
      const response = await axios.get<{
        songs: Song[],
        total_duration: number,
        total_songs: number
      }>(`${API_URL}/api/artists/${artistId}/tracks`, {
        params: { duration: totalDuration }
      });
      
      const { songs, total_duration, total_songs } = response.data;
      
      const durationHours = Math.floor(total_duration / 3600);
      const durationMinutes = Math.floor((total_duration % 3600) / 60);
      const durationSeconds = Math.floor(total_duration % 60);
      
      dispatch(fetchSongsSuccess({
        songs,
        duration: {
          hours: durationHours,
          minutes: durationMinutes,
          seconds: durationSeconds
        },
        totalItems: total_songs
      }));
      
      return songs;
    } catch (error) {
      let errorMessage = 'Failed to fetch songs';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      dispatch(fetchSongsFailure(errorMessage));
      throw error;
    }
  }
);

export const selectArtistAndFetchSongs = createAsyncThunk(
  'catalog/selectArtistAndFetchSongs',
  async (artistId: string, { dispatch }) => {
    dispatch(selectArtist(artistId));
    await dispatch(fetchSongs(artistId));
    return artistId;
  }
); 