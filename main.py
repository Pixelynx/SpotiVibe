from flask import Flask, render_template, request, redirect, url_for, session
from lyrics_analysis import analyze_lyrics
from lyrics_api import get_lyrics_and_info
from spotify_api import get_spotify_client, get_artist_id, get_artist_tracks, get_spotify_oauth
import os
from dotenv import load_dotenv

load_dotenv()
print("GENIUS_API_TOKEN:", os.getenv("GENIUS_API_TOKEN"))

app = Flask(__name__)
app.secret_key = os.urandom(24)

def calculate_total_duration(tracks):
    total_duration_ms = sum(track['duration_ms'] for track in tracks)
    total_seconds = total_duration_ms // 1000
    hours, remainder = divmod(total_seconds, 3600)
    minutes, seconds = divmod(remainder, 60)
    return hours, minutes, seconds

@app.route('/')
def index():
    return render_template('search.html')

@app.route('/search', methods=['POST'])
def search():
    artist_name = request.form['artist']
    
    # Check if user is authenticated
    if 'token_info' not in session:
        return redirect('/login')
    
    sp = get_spotify_client()
    
    artist_id = get_artist_id(sp, artist_name)
    if not artist_id:
        return f"Artist {artist_name} not found.", 404

    tracks = get_artist_tracks(sp, artist_id)
    
    # Prepare data for the template
    main_artists = set()
    song_dict = {}
    # featured_artists = {}
    
    for track in tracks:
        main_artist = track['artists'][0]['name']  # Assume first artist is main artist
        song_name = track['name']
        
        if main_artist not in song_dict:
            song_dict[main_artist] = set()
            main_artists.add(main_artist)
        
        song_dict[main_artist].add(song_name)
        
        # Keep track of featured artists
        # if len(track['artists']) > 1:
        #     featured_artists[song_name] = [artist['name'] for artist in track['artists'][1:]]
    
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
    
    return render_template('releasedMusicTime.html', 
                           artist_name=artist_name,
                           artists=main_artists,
                           song_table=song_table,
                           hours=hours,
                           minutes=minutes,
                           seconds=seconds)
                        #    featured_artists=featured_artists)  # Pass this to template if needed

@app.route('/theme_search', methods=['POST'])
def theme_search():
    query = request.form['query']
    artist_name = request.form['artist']
    
    if 'token_info' not in session:
        return redirect('/login')
    
    try:
        sp = get_spotify_client()
        
        artist_id = get_artist_id(sp, artist_name)
        if not artist_id:
            return render_template('error.html', error=f"Artist {artist_name} not found."), 404

        tracks = get_artist_tracks(sp, artist_id)
        
        relevant_songs = []
        for track in tracks[:50]:  # Limit to first 50 tracks for now
            try:
                song_name = track['name']
                lyrics, genius_url, release_date = get_lyrics_and_info(song_name, artist_name)
                if lyrics:
                    # Process lyrics in chunks if too long
                    chunks = [lyrics[i:i+1000] for i in range(0, len(lyrics), 1000)]
                    for chunk in chunks:
                        if analyze_lyrics(chunk, query):
                            relevant_songs.append({
                                'artist': artist_name,
                                'title': song_name,
                                'year': release_date,
                                'url': genius_url
                            })
                            break
            except Exception as e:
                app.logger.error(f"Error processing track {song_name}: {str(e)}")
        
        return render_template('themeSearchResults.html', 
                               query=query,
                               relevant_songs=relevant_songs)
    except Exception as e:
        app.logger.error(f"An error occurred in theme_search: {str(e)}")
        return render_template('error.html', error="An unexpected error occurred. Please try again later."), 500

# Error handling for 404 and 500 errors
@app.errorhandler(404)
def not_found_error(error):
    return render_template('error.html', error="Page not found"), 404

@app.errorhandler(500)
def internal_error(error):
    app.logger.error(f"Internal error: {str(error)}")
    return render_template('error.html', error="An unexpected error occurred. Please try again later."), 500

@app.route('/login')
def login():
    sp_oauth = get_spotify_oauth()
    auth_url = sp_oauth.get_authorize_url()
    return redirect(auth_url)

@app.route('/callback')
def callback():
    sp_oauth = get_spotify_oauth()
    session.clear()
    code = request.args.get('code')
    token_info = sp_oauth.get_access_token(code)
    session["token_info"] = token_info
    return redirect('/')

if __name__ == "__main__":
    app.run(port=3000, debug=True)