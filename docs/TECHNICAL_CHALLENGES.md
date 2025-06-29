# Technical Challenges and Solutions

## Overview

This document outlines the major technical challenges encountered during SpotiVibe development, the solutions implemented, and lessons learned from the problem-solving process.

## Challenge 1: Genre Filtering Implementation

### Problem Description
- **Issue**: Genre filtering functionality implemented but not working correctly
- **Root Cause**: Spotify API provides genre information at artist level, not track level
- **Current Status**: Feature exists in UI but filters are not applied effectively

### Technical Details
```python
# Current implementation (non-functional)
def process_vibe_search():
    genre_filter = request.form.get('genre')
    
    for track in tracks:
        track_genre = track.get('genre', '').lower()  # This is always empty
        if genre_filter and genre_filter.lower() != track_genre:
            continue  # Never matches because track_genre is empty
```

### Research Findings
1. **Spotify API Limitation**: Individual tracks don't contain genre metadata
2. **Artist-Level Genres**: Genres are associated with artists, not individual songs
3. **Genre Granularity**: Artist genres may not reflect individual song styles

### Proposed Solutions

#### Solution 1: Artist-Based Genre Filtering
```python
def get_artist_genres(sp, artist_id):
    artist_info = sp.artist(artist_id)
    return artist_info.get('genres', [])

def apply_genre_filter(tracks, genre_filter, sp):
    if not genre_filter:
        return tracks
    
    filtered_tracks = []
    for track in tracks:
        artist_id = track['artists'][0]['id']
        artist_genres = get_artist_genres(sp, artist_id)
        
        # Check if any artist genre matches the filter
        if any(genre_filter.lower() in genre.lower() for genre in artist_genres):
            filtered_tracks.append(track)
    
    return filtered_tracks
```

#### Solution 2: Genre Mapping Database
```python
# Pre-computed genre mappings
GENRE_MAPPINGS = {
    'pop': ['pop', 'electropop', 'dance pop', 'indie pop'],
    'hip hop': ['hip hop', 'rap', 'trap', 'conscious hip hop'],
    'r&b': ['r&b', 'contemporary r&b', 'neo soul', 'alternative r&b'],
    'country': ['country', 'country pop', 'country rock', 'modern country rock']
}

def match_genre_category(artist_genres, target_genre):
    if target_genre not in GENRE_MAPPINGS:
        return False
    
    target_variations = GENRE_MAPPINGS[target_genre]
    return any(
        any(variation in genre.lower() for variation in target_variations)
        for genre in artist_genres
    )
```

### Implementation Status
- **Current**: Genre filter UI exists but non-functional
- **Next Steps**: Implement artist-based genre filtering
- **Timeline**: 1-2 weeks for basic implementation

## Challenge 2: Session Management Complexity

### Problem Description
- **Issue**: Complex session state management across multiple API calls
- **Impact**: Token expiration, data persistence, user experience
- **Complexity**: OAuth tokens, search state, user preferences

### Technical Details
```python
# Current session management
@app.route('/process_vibe_search')
def process_vibe_search():
    query = session.get('query')
    artist_name = session.get('artist_name')
    # Session data may be lost or corrupted
    
    if 'token_info' not in session:
        return redirect('/login')  # Frequent redirects
```

### Challenges Identified
1. **Token Expiration**: Spotify tokens expire after 1 hour
2. **Session Persistence**: Flask sessions lost on server restart
3. **State Management**: Complex state across multiple requests
4. **User Experience**: Frequent re-authentication required

### Solutions Implemented

#### Token Refresh Mechanism
```python
def get_spotify_client():
    token_info = session.get('token_info', None)
    if not token_info:
        raise Exception("User not authenticated")
    
    # Check if token needs refresh
    if token_info.get('expires_at', 0) < time.time():
        sp_oauth = get_spotify_oauth()
        token_info = sp_oauth.refresh_access_token(token_info['refresh_token'])
        session['token_info'] = token_info
    
    return spotipy.Spotify(auth=token_info['access_token'])
```

#### Session State Management
```python
class SessionManager:
    def __init__(self):
        self.redis_client = redis.Redis()
    
    def store_search_state(self, user_id, search_data):
        key = f"search_state:{user_id}"
        self.redis_client.setex(key, 3600, json.dumps(search_data))
    
    def get_search_state(self, user_id):
        key = f"search_state:{user_id}"
        data = self.redis_client.get(key)
        return json.loads(data) if data else None
```

## Challenge 3: Error Handling Across Multiple APIs

### Problem Description
- **Issue**: Cascading failures when external APIs are unavailable
- **Impact**: Complete application failure for single API issues
- **Complexity**: Different error types from Spotify and Genius APIs

### Error Scenarios
1. **Spotify API**: Rate limiting, authentication errors, artist not found
2. **Genius API**: Rate limiting, content not found, HTML parsing failures
3. **Network Issues**: Timeouts, connection errors, DNS failures

### Solution: Comprehensive Error Handling
```python
# [TODO]: Example for error handling + degredation strategy

```

## Challenge 4: NLP Model Performance and Accuracy

### Problem Description
- **Issue**: DeBERTa model provides better results than BART but still lacks accuracy
- **Root Cause**: Word matching rather than semantic understanding
- **Impact**: Poor user experience with irrelevant search results

### Analysis of Current Implementation
```python
# Current approach limitations
def analyze_lyrics(lyrics, query):
    result = classifier(lyrics, candidate_labels=[query, "unrelated"], multi_label=False)
    # Binary classification loses nuance
    is_relevant = result['labels'][0] == query and result['scores'][0] > 0.5
    return is_relevant
```

### Identified Issues
1. **Binary Classification**: Only relevant/not relevant, no gradation
2. **Generic Training**: Model not trained on music-specific content
3. **Context Loss**: 1000-character chunks lose narrative context
4. **Threshold Rigidity**: Fixed 0.5 threshold may not be optimal

### Research-Based Solutions

```python
# [TODO]: Code examples for future solutions

```

## Challenge 5: Real-Time User Experience

### Problem Description
- **Issue**: Long processing times without user feedback
- **Impact**: High abandonment rates, poor user experience
- **Technical Challenge**: Providing progress updates during processing

### Solutions Implemented

```python
# [TODO]: Code examples for future solutions

```

## Challenge 6: Data Quality and Consistency

### Problem Description
- **Issue**: Inconsistent data quality from external APIs
- **Examples**: Missing lyrics, incorrect artist matching, duplicate tracks
- **Impact**: Reduced search accuracy and user satisfaction

### Data Quality Issues Identified
1. **Genius API**: Inconsistent lyric formatting, missing songs
2. **Spotify API**: Duplicate tracks, inconsistent artist names
3. **Matching Problems**: Song titles don't match between APIs

### Solutions Implemented

```python
# [TODO]: Code example for data sanitization

```

## Lessons Learned

### Technical Insights
1. **External API Reliability**: Always implement fallback strategies
2. **User Experience**: Progress feedback is crucial for long-running operations
3. **Data Quality**: Validation and cleaning are essential for external data
4. **Error Handling**: Graceful degradation prevents complete failures

### Architectural Decisions
1. **Modular Design**: Separate concerns for maintainability
2. **Caching Strategy**: Essential for performance and API limits
3. **Session Management**: Complex but critical for user experience
4. **Testing Strategy**: Mock external dependencies for reliable testing

### Future Improvements
1. **Enhanced NLP**: Specialized music emotion models
2. **Performance**: Concurrent processing and caching
3. **Reliability**: Better error handling and fallback mechanisms
4. **User Experience**: Real-time updates and progressive loading

## Conclusion

The challenges encountered in SpotiVibe development highlight the complexity of integrating multiple external APIs while maintaining good user experience.

Key takeaways include the importance of robust error handling, the need for specialized NLP models for music analysis, and the critical role of user feedback in long-running operations. These lessons inform the roadmap for future development and optimization efforts. 