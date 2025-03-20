from flask import Blueprint, request, jsonify, session
from services.spotify_api import get_spotify_client, get_artist_id, get_artist_tracks

catalog_bp = Blueprint('catalog', __name__)

def calculate_total_duration(tracks):
    total_duration_ms = sum(track['duration_ms'] for track in tracks)
    total_seconds = total_duration_ms // 1000
    hours, remainder = divmod(total_seconds, 3600)
    minutes, seconds = divmod(remainder, 60)
    return hours, minutes, seconds

@catalog_bp.route('/api/catalog_duration', methods=['POST'])
def catalog_duration():
    data = request.json
    artist_name = data.get('artist')
    
    # Check if user is authenticated
    if 'token_info' not in session:
        return jsonify({"error": "Not authenticated"}), 401
    
    try:
        sp = get_spotify_client()
        
        artist_id = get_artist_id(sp, artist_name)
        if not artist_id:
            return jsonify({"error": f"Artist {artist_name} not found"}), 404

        tracks = get_artist_tracks(sp, artist_id)
        
        # Prepare data for the response
        main_artists = set()
        song_dict = {}
        
        for track in tracks:
            main_artist = track['artists'][0]['name']  # Assume first artist is main artist
            song_name = track['name']
            
            if main_artist not in song_dict:
                song_dict[main_artist] = set()
                main_artists.add(main_artist)
            
            song_dict[main_artist].add(song_name)
        
        # Convert sets to sorted lists for consistent display
        for artist in song_dict:
            song_dict[artist] = sorted(list(song_dict[artist]))

        main_artists = sorted(list(main_artists))
        max_songs = max(len(songs) for songs in song_dict.values())
        
        song_table = []
        for i in range(max_songs):
            row = []
            for artist in main_artists:
                if i < len(song_dict.get(artist, [])):
                    row.append(song_dict[artist][i])
                else:
                    row.append('')
            song_table.append(row)

        hours, minutes, seconds = calculate_total_duration(tracks)
        
        return jsonify({
            "artist_name": artist_name,
            "artists": main_artists,
            "song_table": song_table,
            "duration": {
                "hours": hours,
                "minutes": minutes,
                "seconds": seconds
            }
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500 