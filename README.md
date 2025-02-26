# Spotify Vibe Search and Artist Music Time Calculator

This application utilizes the Spotify API to search for songs based on a given "vibe" and calculate the total duration of an artist's officially released music on the platform. The project consists of two main components:

1.  Vibe Search: Users can input a word or phrase that represents a certain vibe, and the application searches for songs with similar vibes.
2.  Artist Music Time Calculator: The app calculates and displays the total duration of an artist's music catalog on Spotify.

### Demo v1:
![SpotiVibe-v1-demo](https://github.com/user-attachments/assets/3864efe8-11b4-477a-8883-f988b48c4b49)

## Features

-   User authentication with Spotify
-   Search for artists and retrieve their tracks
-   Calculate total duration of an artist's music catalog
-   Search for songs based on a given "vibe" using lyrics analysis
-   Paginated display of search results

## Current Functionality

1.  **User Authentication**: The application uses Spotify OAuth for user authentication.
2.  **Artist Search**: Users can search for an artist, and the app retrieves the artist's tracks from Spotify.
3.  **Music Time Calculation**: The app calculates the total duration of an artist's music catalog and displays it in hours, minutes, and seconds.
4.  **Vibe Search**: Users can input a word or phrase, and the app searches for songs with lyrics that match the given vibe.
5.  **Lyrics Analysis**: The app uses a zero-shot classification model to analyze lyrics and determine if they match the given vibe.
6.  **Pagination**: Search results are paginated for better user experience.

## Areas for Improvement

1.  **Performance Optimization**: The app currently has issues with long request times, especially for artists with large discographies. This needs to be optimized, possibly by implementing caching or batch processing.

2.  **Lyrics Analysis Accuracy**: The current method of analyzing lyrics is not effective at detecting intent or feeling. It primarily returns songs with similar words in the lyrics. This needs to be improved to better capture the essence of the "vibe" search.

3.  **Error Handling**: While there is some error handling in place, it could be more robust and user-friendly. Implement more specific error messages and graceful error recovery.

4.  **Rate Limiting**: Implement better rate limiting for API requests to avoid hitting rate limits, especially for the Genius API.

5.  **Caching**: Implement caching for API responses to reduce the number of requests and improve performance.

6.  **Asynchronous Processing**: Consider using asynchronous processing for time-consuming tasks like retrieving and analyzing lyrics.

7.  **Code Organization**: The code could be better organized into separate modules for different functionalities (e.g., Spotify API handling, lyrics retrieval, analysis).

8.  **Environment Variables**: Ensure all sensitive information (API keys, client IDs, etc.) are properly stored as environment variables.

9. **Testing**: Implement unit tests and integration tests to ensure the reliability of the application.

