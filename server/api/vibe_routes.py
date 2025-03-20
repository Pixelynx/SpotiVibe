from math import ceil
from flask import Blueprint, request, jsonify, session, current_app
from services.spotify_api import get_spotify_client, get_artist_id, get_artist_tracks
from services.lyrics_api import get_lyrics_and_info
from services.lyrics_analysis import analyze_lyrics

vibe_bp = Blueprint('vibe', __name__)

@vibe_bp.route('/api/vibe_search', methods=['POST'])
def vibe_search():
    data = request.json
    query = data.get('query')
    artist_name = data.get('artist')
    genre = data.get('genre')
    page = data.get('page', 1)
    per_page = 25

    if not query:
        return jsonify({"error": "Query is required"}), 400

    if 'token_info' not in session:
        return jsonify({"error": "Not authenticated"}), 401
    
    try:
        sp = get_spotify_client()
        
        if artist_name:
            artist_id = get_artist_id(sp, artist_name)
            if not artist_id:
                return jsonify({"error": f"Artist {artist_name} not found"}), 404
            tracks = get_artist_tracks(sp, artist_id)
        else:
            # TODO: Handle case when no artist is specified
            return jsonify({"error": "Artist name is required"}), 400
        
        relevant_songs = []
        analyzed_songs = set()

        # Check if artist or genre is provided
        artist_filter = artist_name if artist_name else None
        genre_filter = genre if genre else None

        for track in tracks:
            try:
                song_name = track['name']
                track_genre = track.get('genre', '').lower()
                
                # Apply filters
                if artist_filter and artist_filter.lower() not in [artist['name'].lower() for artist in track['artists']]:
                    continue
                if genre_filter and genre_filter.lower() != track_genre:
                    continue

                # Create a unique identifier for the song
                song_id = f"{song_name.lower()}_{artist_name.lower()}"
                
                # Skip if we've already analyzed this song
                if song_id in analyzed_songs:
                    continue
                
                analyzed_songs.add(song_id)  # Mark as analyzed

                lyrics, genius_url, release_date = get_lyrics_and_info(song_name, artist_name)
                if lyrics:
                    chunks = [lyrics[i:i+1000] for i in range(0, len(lyrics), 1000)]
                    for chunk in chunks:
                        if analyze_lyrics(chunk, query):
                            relevant_songs.append({
                                'artist': artist_name,
                                'title': song_name,
                                'year': release_date,
                                'url': genius_url
                            })
                            break  # No need to check other chunks if it's relevant
            except Exception as e:
                current_app.logger.error(f"Error processing track {song_name}: {str(e)}")

        total_results = len(relevant_songs)
        total_pages = ceil(total_results / per_page)
        start = (page - 1) * per_page
        end = start + per_page
        paginated_songs = relevant_songs[start:end]

        return jsonify({
            "query": query,
            "relevant_songs": paginated_songs,
            "total_pages": total_pages,
            "current_page": page,
            "total_results": total_results
        })
    except Exception as e:
        current_app.logger.error(f"An error occurred in vibe_search: {str(e)}")
        return jsonify({"error": str(e)}), 500 