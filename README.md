# SpotiVibe

A modern web application that combines the power of Spotify's music catalog with lyric analysis to help users discover songs based on specific vibes and calculate artist catalog durations.

## Overview

SpotiVibe is a full-stack application that provides two main features:

1. **Vibe Search**: An intelligent search system that finds songs matching a specific vibe or feeling by analyzing lyrics using natural language processing.
2. **Catalog Duration Calculator**: Calculates the total duration of an artist's officially released music on Spotify.

### Demo v1:
![SpotiVibe-v1-demo](https://github.com/user-attachments/assets/3864efe8-11b4-477a-8883-f988b48c4b49)

## Architecture

The application follows a client-server architecture:

- **Frontend**: Modern web interface built with HTML, CSS, and JavaScript
- **Backend**: Python Flask server handling API requests and business logic
- **External APIs**: Integration with Spotify and Genius APIs

## Quick Start

### Prerequisites

- Python 3.8+
- Node.js 14+ (for client development)
- Spotify Developer Account
- Genius API Access

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/spotiVibe.git
   cd spotiVibe
   ```

2. Set up the Python virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

3. Configure environment variables:
   Create a `.env` file in the root directory with:
   ```
   SPOTIFY_CLIENT_ID=your_client_id
   SPOTIFY_CLIENT_SECRET=your_client_secret
   GENIUS_ACCESS_TOKEN=your_genius_token
   ```

4. Start the server:
   ```bash
   python main.py
   ```

5. Access the application at `http://localhost:3000`

## Features

- **User Authentication**: Secure Spotify OAuth integration
- **Vibe Search**: Lyric analysis for finding songs matching specific vibes
- **Artist Catalog**: Complete artist discography duration calculation
- **Flexible Search**: Multiple search filters (vibe, artist, genre)
- **Responsive Design**: Modern, mobile-friendly interface

## Project Structure

```
spotiVibe/
├── client/           # Frontend code
├── server/           # Backend code
├── templates/        # HTML templates
├── assets/          # Static assets
├── docs/            # Documentation
└── tests/           # Test files
```

## Documentation

For detailed documentation, please refer to:
- [Client Documentation](client/README.md)
- [Server Documentation](server/README.md)

## Acknowledgments

- Spotify Web API
- Genius API
- DeBERTa model for NLP analysis
