# SpotiVibe Client

The frontend interface for SpotiVibe, providing an intuitive and responsive user experience for searching songs by vibe and calculating artist catalog durations.

## UI/UX Features

- **Modern Design**: Clean, dark-themed interface inspired by Spotify's aesthetic
- **Responsive Layout**: Responsive design that works on desktop and mobile devices
- **Interactive Elements**: Smooth transitions and hover effects for better user engagement
- **Tab-based Navigation**: Easy switching between Vibe Search and Catalog Duration features
- **Dynamic Search Filters**: Flexible search options with artist and genre filters

## Frontend Technologies

- HTML5
- CSS3 (with modern features like Flexbox and CSS Grid)
- Vanilla JavaScript

## Components

### Main Components

1. **Search Container**
   - Central component housing all search functionality
   - Gradient background with hover effects
   - Responsive padding and spacing

2. **Tab Navigation**
   - Toggle between Vibe Search and Catalog Duration
   - Active state indication
   - Smooth transition effects

3. **Search Forms**
   - Vibe Search Form
     - Vibe input field
     - Optional artist filter
     - Optional genre filter
   - Catalog Duration Form
     - Artist input field

## Development

### Running the Development Server

1. Ensure you have the backend server running (see server README)
2. The frontend is served directly by the Flask backend
3. Access the application at `http://localhost:3000`

### Building for Production

1. The application is currently served directly by Flask
2. No build step is required
3. Static assets are served from the `templates` directory

### Testing

1. Manual testing is currently implemented
2. Test cases to verify:
   - Tab switching functionality
   - Form validation
   - Search filter toggling
   - Responsive design breakpoints

## Browser Support

- Chrome
- Firefox
- Safari
- Edge

## Future Improvements

1. **UI Enhancements**
   - Add loading animations
   - Implement error state designs
   - Add success feedback animations

2. **Accessibility**
   - Implement ARIA labels
   - Add keyboard navigation
   - Improve screen reader support

3. **Performance**
   - Optimize asset loading
   - Implement lazy loading for images
   - Add service worker for offline support

4. **Testing**
   - Implement automated UI testing
   - Add end-to-end testing
   - Set up continuous integration
