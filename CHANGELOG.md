# Changelog

## [Unreleased]

### [2025-08-13]

### Added
- Comprehensive AI Agent infrastructure for enhanced song-emotion matching
- Type-safe data structures with Python dataclasses for AI analysis
- Abstract base classes for modular AI model implementation
- Sophisticated error handling with custom exception hierarchy
- Async/await patterns for concurrent processing of audio and emotion analysis
- Caching system for optimized performance
- Feedback learning system for continuous improvement
- Multi-modal analysis support combining lyrics and audio features
- Comprehensive logging system for debugging and monitoring

### Changed
- Enhanced lyrics analysis from basic zero-shot classification to multi-model approach
- Improved vibe matching precision with combined audio and lyrical analysis
- Restructured AI services with proper dependency injection
- Updated core analysis pipeline with concurrent processing

### Fixed
- Improved analysis precision with multi-modal approach
- Enhanced error handling with specific exception types
- Better type safety with comprehensive type hints
- Optimized performance with built-in caching

### [2023-03-25]

### Added
- Redux state management for VibeSearch feature
- Centralized state management through Redux store for consistent UX
- Typed Redux hooks for easy component integration
- Year filtering through Redux actions and reducers
- Pagination controlled through Redux state

### Changed
- Refactored VibeSearchPage to use Redux for state management
- Updated YearFilter to work with Redux selectors
- Simplified SearchResults component by removing prop drilling
- Enhanced Home component to initialize Redux state before navigation
- Improved search flow with better state management

### Fixed
- Fixed React hooks usage pattern in SearchResults component
- Removed unnecessary SearchResultsWrapper props
- Streamlined state flow between components

### [2023-03-24]

### Added
- Year filter for Vibe Search results 
- Dynamic filtering capability for search results by release year
- Consistent UI components across DurationPage and VibeSearchPage
- Smart date parsing for various date formats including "Month Day, Year" format
- Shared date utilities for consistent date handling across components

### Changed
- Enhanced VibeSearchPage with a filter interface matching DurationPage's artist selector
- Updated SearchResults component to support filterable content
- Improved Back to Home button styling and placement in VibeSearchPage
- Refactored date handling into shared utility functions

### Fixed
- Fixed year filtering to properly extract and filter by year instead of full date string
- Added robust validation and debugging to ensure correct year extraction
- Improved display of release years to only show the year portion of dates
- Enhanced year filter label to clearly indicate filtering by release year
- Optimized filtering process with better error handling
- Added smart date handling to extract years from complex date formats
- Implemented shared date extraction utilities for consistent behavior
- Eliminated code duplication by centralizing date extraction logic

### [2023-03-23]

### Added
- Enhanced state management with new fields in CatalogState type
- Original artist tracking to maintain search context
- All songs collection for improved filtering capabilities
- Improved button positioning in Duration Page

### Changed
- Refactored artist selection to filter songs without additional API calls
- Enhanced UI layout with better component organization and spacing
- Improved artist selector with visual hierarchy and better interaction design
- Updated song collection grid to dynamically filter based on selected artist [bugged]
- Optimized Redux state to separate search context from selection context

### Fixed
- Fixed artist search and display issue where the header would show the selected artist instead of the searched artist
- Improved filtering logic to properly display songs belonging to selected artists
- Enhanced state synchronization between the artist selector and song collection

### [2023-03-22]

### Added
- Redux state management for improved data flow and state organization
- Redux Toolkit implementation with slices, actions, and selectors
- Pagination for song lists in Duration Page
- Async thunks for API interactions
- Type-safe Redux hooks for component integration
- Centralized state management for artist and song data

### Changed
- Refactored DurationPage to use Redux instead of local state
- Improved data fetching with centralized redux actions
- Enhanced component organization with proper separation of concerns
- Better type safety with well-defined Redux state types

### [2023-03-20]

### Added
- Complete React frontend with TypeScript and Material UI
- Backend API endpoints for retrieving catalog duration and vibe search
- Authentication flow with Spotify OAuth
- Responsive design and improved user experience with animations
- Type safety with TypeScript interfaces and props validation
- Progressive loading with transparent overlays that show UI while fetching data

### Changed
- Migrated from server-rendered HTML templates to a modern React SPA
- Restructured backend into a proper API service
- Organized code into a client-server architecture
- Updated styling to use Material UI components and theme system
- Improved Loading component to be a transparent overlay instead of a full-page replacement

### Fixed
- Improved error handling and loading states
- Type safety issues with proper TypeScript interfaces
- Better state management with React hooks
- CORS configuration to properly handle cross-origin requests with credentials
- Authentication flow between React frontend and Flask backend
- Environment variable setup for API base URL configuration
- Fixed hot module reloading issues with updated CORS policy
- Enhanced user experience by showing UI elements during loading states

## [Previous Changes]

### Added
- New search filters for Vibe Search: Now search by Vibe Only, Vibe & Artist, Vibe & Genre, Vibe, Artist, & Genre.

### Changed
- Updated README to include information about new search filters.
