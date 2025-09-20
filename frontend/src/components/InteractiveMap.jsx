import React, { useState, useEffect, useCallback } from 'react';
import { GoogleMap, Marker, DirectionsRenderer, useJsApiLoader } from '@react-google-maps/api';
import { motion } from 'framer-motion';
import { MapPin, Navigation, Clock, DollarSign } from 'lucide-react';

const libraries = ['places', 'geometry'];

const InteractiveMap = ({ itinerary, tripDetails, onLocationUpdate }) => {
  const [directions, setDirections] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [center, setCenter] = useState({ lat: 35.6762, lng: 139.6503 }); // Default to Tokyo
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [loading, setLoading] = useState(false);

  // Google Maps API configuration
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY || 'YOUR_API_KEY_HERE',
    libraries: libraries
  });

  // Geocode destination to get center coordinates
  const geocodeDestination = useCallback(async (destination) => {
    if (!window.google || !window.google.maps) return;

    const geocoder = new window.google.maps.Geocoder();
    return new Promise((resolve, reject) => {
      geocoder.geocode({ address: destination }, (results, status) => {
        if (status === 'OK' && results[0]) {
          const location = results[0].geometry.location;
          resolve({
            lat: location.lat(),
            lng: location.lng()
          });
        } else {
          reject(new Error('Geocoding failed'));
        }
      });
    });
  }, []);

  // Generate route between activities
  const generateRoute = useCallback(async (activities) => {
    if (!window.google || !window.google.maps || activities.length < 2) return;

    const directionsService = new window.google.maps.DirectionsService();
    const waypoints = activities
      .filter(activity => activity.location)
      .map(activity => ({
        location: activity.location,
        stopover: true
      }));

    if (waypoints.length < 2) return;

    try {
      const result = await directionsService.route({
        origin: waypoints[0].location,
        destination: waypoints[waypoints.length - 1].location,
        waypoints: waypoints.slice(1, -1),
        travelMode: window.google.maps.TravelMode.WALKING,
        optimizeWaypoints: true
      });

      setDirections(result);
    } catch (error) {
      console.error('Route generation failed:', error);
    }
  }, []);

  // Process itinerary and create markers
  const processItinerary = useCallback(async () => {
    if (!itinerary || !tripDetails) return;

    setLoading(true);
    try {
      // Set center to destination
      const destinationCoords = await geocodeDestination(tripDetails.destination);
      setCenter(destinationCoords);

      // Create markers for all activities
      const allMarkers = [];
      const allActivities = [];

      // Process activities sequentially to handle async geocoding
      for (let dayIndex = 0; dayIndex < itinerary.length; dayIndex++) {
        const day = itinerary[dayIndex];
        for (let activityIndex = 0; activityIndex < day.activities.length; activityIndex++) {
          const activity = day.activities[activityIndex];
          const markerId = `${dayIndex}-${activityIndex}`;
          
          // If activity has location, use it; otherwise geocode the activity name
          let location = activity.location;
          if (!location && activity.name) {
            try {
              location = await geocodeDestination(`${activity.name}, ${tripDetails.destination}`);
            } catch (error) {
              console.warn(`Could not geocode ${activity.name}:`, error);
              location = destinationCoords; // Fallback to destination
            }
          }

          if (location) {
            allMarkers.push({
              id: markerId,
              position: location,
              day: dayIndex + 1,
              activity: activityIndex + 1,
              activityData: activity,
              dayData: day
            });

            allActivities.push({
              ...activity,
              location: typeof location === 'string' ? location : `${location.lat},${location.lng}`
            });
          }
        }
      }

      setMarkers(allMarkers);

      // Generate route for the day's activities
      if (allActivities.length > 1) {
        await generateRoute(allActivities);
      }

    } catch (error) {
      console.error('Error processing itinerary:', error);
    } finally {
      setLoading(false);
    }
  }, [itinerary, tripDetails, geocodeDestination, generateRoute]);

  // Initialize map when itinerary changes
  useEffect(() => {
    if (isLoaded && itinerary && tripDetails) {
      processItinerary();
    }
  }, [isLoaded, itinerary, tripDetails, processItinerary]);

  // Handle marker click
  const handleMarkerClick = (marker) => {
    setSelectedActivity(marker);
  };

  // Handle location update for an activity
  const handleLocationUpdate = (markerId, newLocation) => {
    if (onLocationUpdate) {
      const [dayIndex, activityIndex] = markerId.split('-').map(Number);
      onLocationUpdate(dayIndex, activityIndex, newLocation);
    }
  };

  if (loadError) {
    return (
      <div className="bg-white/5 p-8 rounded-lg text-center">
        <p className="text-white/70">Failed to load Google Maps. Please check your API key.</p>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="bg-white/5 p-8 rounded-lg text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
        <p className="text-white/70">Loading map...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Map Container */}
      <div className="relative">
        <GoogleMap
          mapContainerStyle={{ width: '100%', height: '400px' }}
          center={center}
          zoom={13}
          options={{
            styles: [
              {
                featureType: 'all',
                elementType: 'geometry.fill',
                stylers: [{ color: '#1a1a1a' }]
              },
              {
                featureType: 'water',
                elementType: 'geometry',
                stylers: [{ color: '#0f3460' }]
              },
              {
                featureType: 'road',
                elementType: 'geometry',
                stylers: [{ color: '#2d2d2d' }]
              },
              {
                featureType: 'poi',
                elementType: 'labels.text.fill',
                stylers: [{ color: '#ffffff' }]
              }
            ],
            disableDefaultUI: false,
            zoomControl: true,
            streetViewControl: false,
            fullscreenControl: true
          }}
        >
          {/* Route */}
          {directions && (
            <DirectionsRenderer
              directions={directions}
              options={{
                polylineOptions: {
                  strokeColor: '#FFD700',
                  strokeWeight: 4,
                  strokeOpacity: 0.8
                },
                suppressMarkers: true
              }}
            />
          )}

          {/* Activity Markers */}
          {markers.map((marker) => (
            <Marker
              key={marker.id}
              position={marker.position}
              onClick={() => handleMarkerClick(marker)}
              icon={{
                url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
                  <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="16" cy="16" r="12" fill="#FFD700" stroke="#000" stroke-width="2"/>
                    <text x="16" y="20" text-anchor="middle" font-family="Arial" font-size="12" font-weight="bold" fill="#000">
                      ${marker.day}.${marker.activity}
                    </text>
                  </svg>
                `)}`,
                scaledSize: new window.google.maps.Size(32, 32),
                anchor: new window.google.maps.Point(16, 16)
              }}
            />
          ))}
        </GoogleMap>

        {/* Loading Overlay */}
        {loading && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
            <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mx-auto mb-2"></div>
              <p className="text-white text-sm">Processing locations...</p>
            </div>
          </div>
        )}
      </div>

      {/* Activity Details Panel */}
      {selectedActivity && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="bg-white/5 border border-white/10 rounded-lg p-4"
        >
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="text-white font-semibold text-lg">
                Day {selectedActivity.day}, Activity {selectedActivity.activity}
              </h3>
              <p className="text-white/70 text-sm">
                {selectedActivity.dayData.title || `Day ${selectedActivity.day}`}
              </p>
            </div>
            <button
              onClick={() => setSelectedActivity(null)}
              className="text-white/50 hover:text-white"
            >
              ×
            </button>
          </div>

          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <MapPin className="text-white/60" size={16} />
              <div>
                <p className="text-white font-medium">{selectedActivity.activityData.name}</p>
                <p className="text-white/70 text-sm">{selectedActivity.activityData.description}</p>
              </div>
            </div>

            {selectedActivity.activityData.estimated_cost && (
              <div className="flex items-center space-x-3">
                <DollarSign className="text-white/60" size={16} />
                <p className="text-white/70 text-sm">
                  Estimated cost: {selectedActivity.activityData.estimated_cost}
                </p>
              </div>
            )}

            {selectedActivity.activityData.duration && (
              <div className="flex items-center space-x-3">
                <Clock className="text-white/60" size={16} />
                <p className="text-white/70 text-sm">
                  Duration: {selectedActivity.activityData.duration}
                </p>
              </div>
            )}

            <div className="pt-2 border-t border-white/10">
              <button
                onClick={() => handleLocationUpdate(selectedActivity.id, selectedActivity.position)}
                className="text-white/80 hover:text-white text-sm underline"
              >
                Update location
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Map Controls */}
      <div className="flex items-center justify-between text-sm text-white/70">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
            <span>Route</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-yellow-400 rounded-full border border-black"></div>
            <span>Activities</span>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Navigation className="text-white/60" size={14} />
          <span>Walking route optimized</span>
        </div>
      </div>
    </div>
  );
};

export default InteractiveMap;
