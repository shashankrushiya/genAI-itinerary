# GenItinerary - AI Travel Planner

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python 3.8+](https://img.shields.io/badge/python-3.8+-blue.svg)](https://www.python.org/downloads/)
[![React 18](https://img.shields.io/badge/React-18-blue.svg)](https://reactjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-green.svg)](https://fastapi.tiangolo.com/)

**GenItinerary** is a comprehensive AI-powered travel itinerary planning platform that combines artificial intelligence, real-time data, and community features to create personalized travel experiences.

## Features

### AI-Powered Itinerary Generation
- **Smart Planning**: Uses Google Gemini AI to create detailed day-by-day itineraries
- **Personalized Recommendations**: Considers destination, duration, budget, interests, and travel style
- **Activity Suggestions**: Generates specific activities, restaurants, and attractions with timing
- **Cost Estimation**: Provides realistic budget estimates for each activity

### Date Range Planning
- **Flexible Scheduling**: Start and end date selection for precise trip planning
- **Live Constraints**: Real-time weather data integration for optimal timing
- **Seasonal Awareness**: AI considers weather patterns and seasonal factors

### Budget Management
- **Multiple Budget Tiers**: Budget-friendly to luxury options
- **Cost Breakdown**: Per-day and per-activity cost estimates
- **Currency Support**: Handles multiple currencies (USD, EUR, etc.)
- **Smart Pricing**: AI-optimized suggestions within budget constraints

### Travel Style Customization
- **Adventure**: Outdoor activities, hiking, extreme sports
- **Cultural**: Museums, historical sites, local experiences
- **Relaxation**: Spas, beaches, peaceful activities
- **Foodie**: Culinary tours, local cuisine, food experiences
- **Business**: Professional venues, networking opportunities
- **Family**: Kid-friendly activities, family attractions

### Live Weather Integration
- **Real-time Updates**: Current weather conditions and forecasts
- **Open-Meteo API**: Reliable weather data for any destination
- **Smart Adjustments**: AI suggests indoor alternatives for bad weather
- **Seasonal Planning**: Long-term weather trends for trip planning

### Flight Integration
- **EaseMyTrip Partnership**: Direct flight booking integration
- **Exclusive Deals**: Special discounts for platform users
- **Smart Recommendations**: AI-suggested flight times and routes
- **Seamless Booking**: One-click access to flight booking

### Interactive Maps
- **Google Maps Integration**: Visual itinerary representation
- **Route Optimization**: Smart path planning between activities
- **Location Markers**: Pinpoint exact locations for each activity
- **Directions**: Turn-by-turn navigation support

### Community Features
- **Trip Library**: Browse public itineraries from other travelers
- **Share & Discover**: Make your trips public for others to explore
- **Inspiration**: Get ideas from similar trips and destinations
- **Social Learning**: Learn from other travelers' experiences

## Tech Stack

### Frontend
- **React 18** - Modern UI framework with hooks
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Smooth animations and transitions
- **React Router** - Client-side routing
- **Firebase Auth** - User authentication
- **Google Maps API** - Interactive maps and geocoding

### Backend
- **FastAPI** - High-performance Python web framework
- **Google Gemini AI** - AI-powered itinerary generation
- **Firebase Firestore** - NoSQL database
- **Open-Meteo API** - Weather data integration
- **Python 3.8+** - Backend runtime

### External APIs
- **Google Gemini** - AI itinerary generation
- **Open-Meteo** - Weather forecasts and geocoding
- **Google Maps** - Maps, geocoding, and directions
- **EaseMyTrip** - Flight booking integration

## Quick Start

### Prerequisites
- **Node.js** 16+ and npm
- **Python** 3.8+
- **Firebase** project with Authentication and Firestore enabled
- **Google Cloud** project with Gemini AI API enabled
- **Google Maps** API key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/gen-itinerary.git
   cd gen-itinerary
   ```

2. **Backend Setup**
   ```bash
   # Install Python dependencies
   pip install -r requirements.txt
   
   # Set up environment variables
   cp .env.example .env
   # Edit .env with your API keys and Firebase config
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   
   # Set up Firebase config
   cp src/firebase.example.js src/firebase.js
   # Edit firebase.js with your Firebase config
   ```

4. **Start Development Servers**
   ```bash
   # Terminal 1: Start backend
   python main.py
   
   # Terminal 2: Start frontend
   cd frontend
   npm start
   ```

5. **Access the Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000

## 📁 Project Structure

```
gen-itinerary/
├── frontend/                 # React frontend application
│   ├── public/              # Static assets
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Main application pages
│   │   ├── lib/             # Utility functions and API calls
│   │   └── App.js           # Main application component
│   ├── package.json         # Frontend dependencies
│   └── README.md            # Frontend-specific documentation
├── main.py                  # FastAPI backend server
├── genai_helper.py          # AI integration utilities
├── firebase_config.py       # Firebase configuration
├── auth_middleware.py       # Authentication middleware
├── requirements.txt         # Python dependencies
└── README.md               # This file
```

## Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Firebase Configuration
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY=your-private-key
FIREBASE_CLIENT_EMAIL=your-client-email

# Google Gemini AI
GEMINI_API_KEY=your-gemini-api-key

# Google Maps
GOOGLE_MAPS_API_KEY=your-maps-api-key

# Open-Meteo (no key required)
OPEN_METEO_BASE_URL=https://api.open-meteo.com/v1

# CORS Settings
ALLOWED_ORIGINS=http://localhost:3000
```

### Firebase Setup

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Authentication and Firestore
3. Generate a service account key
4. Add the configuration to your `.env` file

### Google Cloud Setup

1. Create a Google Cloud project
2. Enable the Gemini AI API
3. Generate an API key
4. Add the key to your `.env` file

## Usage Guide

### Creating Your First Trip

1. **Sign Up/Login**: Create an account or sign in
2. **Fill Trip Details**: 
   - Destination (e.g., "Paris, France")
   - Duration (number of days)
   - Budget range
   - Start and end dates
   - Travel style
   - Interests
3. **Generate Itinerary**: Click "Generate Itinerary" and wait for AI processing
4. **Review & Edit**: Customize activities, times, and costs
5. **Save & Share**: Save privately or make public for the community

### Using the Trip Library

1. **Browse Public Trips**: Visit the Trip Library page
2. **Filter & Search**: Use filters for destination, budget, and travel style
3. **View Details**: Click on any trip to see the full itinerary
4. **Get Inspired**: Use ideas from other travelers for your own trips

### Managing Your Trips

1. **Dashboard**: View all your saved trips
2. **Edit**: Modify existing itineraries
3. **Share**: Make trips public or share privately
4. **Export**: Download itineraries as PDF

## Deployment

### Backend Deployment (Google Cloud Run)
```bash
# Build and deploy
gcloud run deploy gen-itinerary-backend \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

### Frontend Deployment (Vercel/Netlify)
```bash
cd frontend
npm run build
# Deploy the build folder to your hosting platform
```

### Environment Variables for Production
- Set all environment variables in your hosting platform
- Ensure CORS is configured for your production domain
- Update Firebase security rules for production

## Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit your changes**: `git commit -m 'Add amazing feature'`
4. **Push to the branch**: `git push origin feature/amazing-feature`
5. **Open a Pull Request**

### Development Guidelines
- Follow PEP 8 for Python code
- Use ESLint for JavaScript/React code
- Write tests for new features
- Update documentation as needed

## API Documentation

### Core Endpoints

#### Generate Itinerary
```http
POST /api/generate-itinerary
Content-Type: application/json
Authorization: Bearer <firebase-token>

{
  "destination": "Paris, France",
  "duration": 5,
  "budget": "medium",
  "interests": ["culture", "food"],
  "start_date": "2024-06-01",
  "end_date": "2024-06-05",
  "travel_style": "cultural",
  "is_public": false
}
```

#### Get Live Constraints
```http
GET /api/live-constraints?destination=Paris&start_date=2024-06-01
```

#### Trip Library
```http
GET /api/trip-library?page=1&limit=12&destination=Paris
```

### Response Format
All API responses follow this format:
```json
{
  "success": true,
  "data": { ... },
  "message": "Success message"
}
```

## Troubleshooting

### Common Issues

#### Firebase Authentication Errors
- Verify Firebase configuration
- Check service account permissions
- Ensure Firestore rules are properly configured

#### AI Generation Failures
- Verify Gemini API key and quotas
- Check internet connectivity
- Review API request format

#### Weather Data Issues
- Open-Meteo API is free but has rate limits
- Check destination name accuracy
- Verify date format (YYYY-MM-DD)

#### Maps Integration Problems
- Verify Google Maps API key
- Check API key restrictions
- Ensure billing is enabled

### Debug Mode
Enable debug logging by setting:
```env
DEBUG=true
LOG_LEVEL=debug
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- **Google Gemini AI** for powerful itinerary generation
- **Open-Meteo** for free weather data
- **Google Maps** for location services
- **Firebase** for authentication and database
- **FastAPI** for the excellent Python framework
- **React** and **Tailwind CSS** for the modern frontend


**Made with ❤️ by the NeuralCoder Team**

*Transform your travel planning with AI-powered itineraries!*
