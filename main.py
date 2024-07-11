from spotify_api import authenticate, get_artist_id, get_artist_tracks

def calculate_total_duration(artist_name):
    sp = authenticate()
    artist_id = get_artist_id(sp, artist_name)
    if not artist_id:
        print(f"Artist {artist_name} not found.")
        return

    tracks = get_artist_tracks(sp, artist_id)
    total_duration_ms = sum(track['duration_ms'] for track in tracks)
    total_duration_hours = total_duration_ms / (1000 * 60 * 60)
    print(f"Total duration of {artist_name}'s tracks: {total_duration_hours:.2f} hours")

if __name__ == "__main__":
    artist_name = input("Enter artist name: ")
    calculate_total_duration(artist_name)