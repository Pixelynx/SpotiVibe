# SpotiVibe Server

The backend server for SpotiVibe, handling API requests, authentication, and integration with external services.

## API Endpoints

### Authentication
- `GET /login`: Initiates Spotify OAuth authentication
- `GET /callback`: Handles OAuth callback and token management

### Search Endpoints
- `POST /catalog_duration`: Calculates total duration of artist's catalog
- `POST /vibe_search`: Initiates vibe-based song search
- `GET /process_vibe_search`: Processes and returns search results

## Authentication

The application uses Spotify OAuth 2.0 for authentication:

1. User initiates login through `/login` endpoint
2. Spotify OAuth flow handles authentication
3. Access token is stored in session
4. Token is used for subsequent API calls

## Environment Variables

Required environment variables in `.env`:

```
SPOTIFY_CLIENT_ID=your_client_id
SPOTIFY_CLIENT_SECRET=your_client_secret
GENIUS_ACCESS_TOKEN=your_genius_token
FLASK_SECRET_KEY=your_secret_key
```

## External Service Integration

### Spotify API
- Artist search and retrieval
- Track information fetching
- User authentication

### Genius API
- Lyric retrieval
- Song metadata
- Artist information

## Future Improvements

### 1. Lyric Analysis Enhancement

#### Current Implementation
- Uses NLP zero-shot classification with DeBERTa model
- Analyzes lyrics from Genius API
- Basic word matching and context analysis

#### Current Limitations
- Analysis is too general
- Matches similar words rather than interpreting vibe/message
- Limited context understanding
- No emotion-specific analysis

#### Improvement Opportunities
- **Model Enhancement**
  - Fine-tune specialized model with music and emotion datasets
  - Implement multi-step analysis pipeline
  - Create emotion vector embedding space for music
  - Hybrid approach combining rule-based and ML methods
  - Few-shot learning with curated examples
  - RAG techniques
  - Custom evaluation metric for lyrical emotion

### 2. Performance Optimization

#### Current Issues
- Excessive load times
- Multiple API calls
- Sequential processing
- No caching implementation

#### Improvement Opportunities
- **Caching Strategy**
  - Implement intelligent caching with TTL
  - Cache popular artists/vibes
  - Store pre-processed analysis results
  - Implement Redis for distributed caching

- **Processing Optimization**
  - Background workers for processing
  - Progressive loading implementation
  - Batch processing for lyric analysis
  - Concurrent API requests
  - Data compression for API responses
  - Server-side rendering for initial loads

### 3. API Enhancements
- Rate limiting implementation
- Request queuing system
- Error handling improvements
- API versioning
- Documentation with Swagger/OpenAPI

### 4. Security Improvements
- Token refresh mechanism
- Rate limiting per user
- Input validation
- XSS protection
- CSRF protection

## Development Setup

1. Create virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Set up environment variables

4. Run development server:
   ```bash
   python main.py
   ```

## Testing Roadmap

[ ] Unit tests for core functionality
[ ] Integration tests for API endpoints
[ ] Mock external API calls
[ ] Performance testing
[ ] Security testing

## Monitoring Roadmap

[ ] Logging implementation
[ ] Error tracking
[ ] Performance metrics
[ ] API usage statistics
