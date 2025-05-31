# 🎵 LyricsSearch - TypeScript Edition

A modern, fast, and user-friendly lyrics search application built with TypeScript, featuring responsive design, offline support, and enhanced user experience.

## ✨ Features

### Core Functionality
- **🔍 Smart Search** - Search for songs by artist name, song title, or lyrics
- **📝 Complete Lyrics** - Get full lyrics for millions of songs
- **⚡ Fast Results** - Optimized API integration with caching
- **📱 Responsive Design** - Works perfectly on desktop, tablet, and mobile

### Enhanced User Experience
- **🎨 Modern UI** - Clean, intuitive interface with smooth animations
- **🌙 Dark Mode** - Automatic theme detection with manual override
- **❤️ Favorites** - Save your favorite songs for quick access
- **🕒 Recent Searches** - Quick access to your search history
- **👥 Popular Artists** - Discover trending artists and songs
- **📋 Copy Lyrics** - One-click copy to clipboard
- **🎵 Audio Previews** - Listen to 30-second song previews

### Technical Features
- **⚡ TypeScript** - Type-safe development with better IDE support
- **🔧 Modern Build Tools** - Vite for fast development and optimized builds
- **♿ Accessibility** - WCAG compliant with keyboard navigation
- **📱 PWA Ready** - Progressive Web App capabilities
- **🔌 Offline Support** - Basic functionality when offline
- **🚀 Performance** - Optimized loading and smooth interactions

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Lyrics-Search/typescript-version
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   Navigate to `http://localhost:3000`

### Build for Production

```bash
npm run build
npm run preview
```

## 🛠️ Development

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

### Project Structure

```
src/
├── main.ts          # Application entry point
├── app.ts           # Main application class
├── api.ts           # API service layer
├── ui.ts            # UI management and DOM manipulation
├── storage.ts       # Local storage management
└── types.ts         # TypeScript type definitions

public/
├── index.html       # HTML template
├── styles.css       # Global styles
└── assets/          # Static assets

dist/                # Production build output
```

### Key Architecture Decisions

- **Modular Design** - Separation of concerns with dedicated modules
- **Type Safety** - Comprehensive TypeScript types for all data structures
- **Event-Driven** - Custom events for loose coupling between components
- **Responsive First** - Mobile-first CSS approach
- **Progressive Enhancement** - Works without JavaScript for basic functionality

## 🎨 Customization

### Themes
The app supports light/dark themes with automatic system detection:

```css
/* Add custom theme variables */
:root {
  --primary-color: #your-color;
  --accent-color: #your-accent;
}

[data-theme="dark"] {
  --primary-color: #your-dark-color;
}
```

### Popular Artists
Customize the popular artists list in `src/app.ts`:

```typescript
private popularArtists: PopularArtist[] = [
  { name: 'Your Artist', image: '🎤', searchTerm: 'your artist' },
  // Add more artists...
];
```

## 🔧 Configuration

### API Configuration
The app uses the lyrics.ovh API. You can modify the API settings in `src/api.ts`:

```typescript
class ApiService {
  private readonly baseURL = 'https://api.lyrics.ovh';
  // Modify endpoints, add authentication, etc.
}
```

### Storage Settings
Customize local storage behavior in `src/storage.ts`:

```typescript
private readonly MAX_RECENT_SEARCHES = 10; // Change limit
```

## 📱 Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Progressive Web App
The app includes PWA features:
- Offline functionality
- App-like experience
- Home screen installation

## 🔒 Privacy & Data

- **No Personal Data Collection** - Only stores search history locally
- **Local Storage Only** - All user data stays on device
- **No Tracking** - No analytics or user tracking
- **Secure API Calls** - All requests use HTTPS

## 🐛 Troubleshooting

### Common Issues

**CORS Errors**
- The app uses a CORS proxy for pagination. If you encounter issues, you may need to set up your own proxy.

**API Rate Limiting**
- The lyrics.ovh API has rate limits. The app includes error handling for this.

**Performance Issues**
- Clear browser cache and local storage
- Check network connection
- Disable browser extensions

### Debug Mode
Access debug information in browser console:
```javascript
// Access app instance
window.__lyricsApp.getState();

// Clear all data
window.__lyricsApp.clearAllData();
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Maintain type safety
- Add unit tests for new features
- Ensure accessibility compliance
- Test on multiple devices/browsers

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **lyrics.ovh** - For providing the lyrics API
- **Inter Font** - For the beautiful typography
- **Vite** - For the amazing build tool
- **TypeScript** - For type safety and developer experience

## 🔮 Roadmap

### Upcoming Features
- [ ] Playlist creation and management
- [ ] Social sharing capabilities
- [ ] Advanced search filters
- [ ] Lyrics translation
- [ ] Music video integration
- [ ] Artist information and biography
- [ ] Song recommendations
- [ ] Offline lyrics caching

### Technical Improvements
- [ ] Unit test suite
- [ ] E2E testing
- [ ] Performance monitoring
- [ ] CDN integration
- [ ] Service worker optimization

---

**Built with ❤️ and TypeScript**

For support or questions, please open an issue on GitHub.