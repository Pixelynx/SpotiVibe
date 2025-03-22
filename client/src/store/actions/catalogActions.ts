import { createAsyncThunk } from '@reduxjs/toolkit';
import { 
  fetchArtistsRequest, 
  fetchArtistsSuccess, 
  fetchArtistsFailure,
  fetchSongsSuccess,
  selectArtist
} from '../slices/catalogSlice';
import axios from 'axios';
import { Artist, Song } from '../types';
import { API_BASE_URL } from '../../config.ts';

const API_URL = API_BASE_URL;

export const fetchArtistCatalogDuration = createAsyncThunk(
  'catalog/fetchArtistCatalogDuration',
  async (artistName: string, { dispatch }) => {
    try {
      dispatch(fetchArtistsRequest());
      
      const response = await axios.post(
        `${API_URL}/api/catalog_duration`, 
        { artist: artistName },
        { withCredentials: true }
      );

      const artistData = response.data;

      const originalArtist = artistName;
  
      const mainArtistName = artistData.artist_name;
      
      // Convert to our Artist model, prioritizing the searched artist first
      const artistNames = [mainArtistName]; // Start with the searched artist
      artistData.artists.forEach((name: string) => {
        // Only add other artists that aren't the main one
        if (name !== mainArtistName) {
          artistNames.push(name);
        }
      });
      
      // Now create artist objects in the desired order
      const artists = artistNames.map((name: string, index: number) => ({
        id: `artist-${index}`,
        name: name,
        isSelected: name === mainArtistName
      }));
      
      // The main artist is now always the first one
      const mainArtist = artists[0];
      
      dispatch(fetchArtistsSuccess(artists));
      dispatch(selectArtist(mainArtist.id));
      
      // Process the song data
      const songs: Song[] = [];
      
      // Flatten the song table
      artistData.song_table.forEach((row: string[]) => {
        row.forEach((songName, artistIndex) => {
          if (songName) {
            songs.push({
              id: `song-${songs.length}`,
              name: songName,
              artist: artistData.artists[artistIndex],
              album: 'Unknown',
              duration: 'Unknown',
              artistId: `artist-${artistIndex}`
            });
          }
        });
      });
      
      // Store the original artist and all songs for reference
      dispatch({
        type: 'catalog/setOriginalArtist',
        payload: originalArtist
      });
      
      // Store all songs for filtering later
      dispatch({
        type: 'catalog/setAllSongs',
        payload: songs
      });
      
      // Dispatch song success action with duration info
      dispatch(fetchSongsSuccess({
        songs,
        duration: artistData.duration,
        totalItems: songs.length
      }));
      
      return {
        artists,
        songs,
        duration: artistData.duration,
        originalArtist
      };
    } catch (error) {
      console.error('Error fetching artist catalog duration:', error);
      let errorMessage = 'Failed to fetch artist catalog';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      dispatch(fetchArtistsFailure(errorMessage));
      throw error;
    }
  }
);

export const selectArtistAndFetchSongs = createAsyncThunk(
  'catalog/selectArtistAndFetchSongs',
  async (artistId: string, { dispatch, getState }) => {
    dispatch(selectArtist(artistId));
    
    // Update the songs display to show only songs from the selected artist
    const state = getState() as any;
    const artists = state?.catalog?.artists || [];
    const allSongs = state?.catalog?.allSongs || [];
    
    // Find the selected artist
    const selectedArtist = artists.find((a: any) => a.id === artistId);
    
    if (selectedArtist) {
      console.log(`Filtering songs for selected artist: ${selectedArtist.name}`);
      
      // Filter songs belonging to the selected artist
      const filteredSongs = allSongs.filter((song: Song) => 
        song.artist === selectedArtist.name || song.artistId === artistId
      );
      
      // Update the songs in the store with the filtered list
      dispatch(fetchSongsSuccess({
        songs: filteredSongs,
        duration: state.catalog.duration,
        totalItems: filteredSongs.length
      }));
    }
    
    return artistId;
  }
); 