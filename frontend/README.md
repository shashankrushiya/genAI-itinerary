#  GenItinerary Frontend

This is the React frontend application for GenItinerary - an AI-powered travel itinerary planner.

##  Quick Start

### Prerequisites
- Node.js 16+ and npm
- Firebase project with Authentication enabled
- Google Maps API key

### Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure Firebase**
   ```bash
   cp src/firebase.example.js src/firebase.js
   # Edit firebase.js with your Firebase config
   ```

3. **Start development server**
   ```bash
   npm start
   ```

4. **Access the application**
   - Open http://localhost:3000

##  Architecture

### Components Structure
```
src/
├── components/           # Reusable UI components
│   ├── Auth.js          # Authentication components
│   ├── Dashboard.jsx    # User dashboard
│   ├── ItineraryDisplay.jsx  # Itinerary viewer/editor
│   ├── TripPlanner.js   # Trip creation form
│   ├── TripLibrary.jsx  # Public trip browser
│   └── InteractiveMap.jsx # Google Maps integration
├── pages/               # Main application pages
│   ├── Landing.jsx     # Landing page
│   ├── App.jsx         # Main app page
│   ├── Demo.jsx        # Demo page
│   └── TripLibraryPage.jsx # Trip library page
├── lib/                # Utility functions
│   ├── api.js          # API communication
│   └── motion.js       # Animation variants
└── App.js              # Main application component
```

### Key Features

#### Modern UI Design
- **Dark Theme**: Professional black theme with luxury accents
- **Responsive**: Mobile-first design with Tailwind CSS
- **Animations**: Smooth transitions with Framer Motion
- **Accessibility**: WCAG compliant components

#### Authentication
- **Firebase Auth**: Secure user authentication
- **Social Login**: Google and email/password options
- **Protected Routes**: Secure access to user features

#### Interactive Maps
- **Google Maps**: Visual itinerary representation
- **Route Planning**: Smart path optimization
- **Location Markers**: Activity pinpoints
- **Real-time Updates**: Dynamic map updates

#### Responsive Design
- **Mobile-First**: Optimized for all screen sizes
- **Touch-Friendly**: Gesture support for mobile
- **Progressive Web App**: Installable on devices

## 🛠️ Development

### Available Scripts

```bash
# Start development server
npm start

# Run tests
npm test

# Build for production
npm run build

# Analyze bundle size
npm run analyze
```

### Code Style
- **ESLint**: Code linting and formatting
- **Prettier**: Code formatting
- **React Hooks**: Modern functional components
- **Tailwind CSS**: Utility-first styling

### State Management
- **React Context**: Global state management
- **useState/useEffect**: Local component state
- **Custom Hooks**: Reusable state logic

## 🔧 Configuration

### Firebase Setup
1. Create a Firebase project
2. Enable Authentication
3. Add your config to `src/firebase.js`:

```javascript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id"
};
```

### Environment Variables
Create a `.env` file in the frontend directory:

```env
REACT_APP_API_BASE_URL=http://localhost:8000
REACT_APP_GOOGLE_MAPS_API_KEY=your-maps-api-key
REACT_APP_FIREBASE_API_KEY=your-firebase-api-key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
```

## Dependencies

### Core Dependencies
- **React 18**: UI framework
- **React Router**: Client-side routing
- **Firebase**: Authentication and database
- **Tailwind CSS**: Styling framework
- **Framer Motion**: Animation library

### Development Dependencies
- **ESLint**: Code linting
- **Prettier**: Code formatting
- **Jest**: Testing framework
- **React Testing Library**: Component testing

## Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Deploy to Netlify
```bash
# Build the project
npm run build

# Deploy the build folder to Netlify
```

### Environment Variables for Production
Set these in your hosting platform:
- `REACT_APP_API_BASE_URL`: Backend API URL
- `REACT_APP_GOOGLE_MAPS_API_KEY`: Google Maps API key
- Firebase configuration variables

## Troubleshooting

### Common Issues

#### Firebase Authentication
- Verify Firebase configuration
- Check authentication rules
- Ensure proper CORS settings

#### Google Maps Integration
- Verify API key and restrictions
- Check billing account status
- Ensure proper domain configuration

#### Build Issues
- Clear node_modules and reinstall
- Check for version conflicts
- Verify environment variables

### Debug Mode
Enable debug logging:
```javascript
// In src/lib/api.js
const DEBUG = process.env.NODE_ENV === 'development';
```

## 📚 Resources

- [React Documentation](https://reactjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Framer Motion](https://www.framer.com/motion/)
- [Firebase Auth](https://firebase.google.com/docs/auth)
- [Google Maps API](https://developers.google.com/maps/documentation)

---

**Happy coding!**