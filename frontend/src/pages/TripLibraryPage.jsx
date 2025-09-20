import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  MapPin, 
  Calendar, 
  DollarSign, 
  Heart, 
  Globe,
  Search,
  User,
  Eye,
  ArrowLeft,
  LogIn,
  UserPlus,
  Home
} from 'lucide-react';
import { fadeInUp, staggerContainer } from '../lib/motion';
import { getPublicTrips, getPublicTripDetails } from '../lib/api';
import LoadingSpinner from '../components/LoadingSpinner';
import ItineraryDisplay from '../components/ItineraryDisplay';

const TripLibraryPage = () => {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [showTripDetails, setShowTripDetails] = useState(false);
  const [filters, setFilters] = useState({
    destination: '',
    budget: '',
    travel_style: ''
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [showAll, setShowAll] = useState(true);
  const navigate = useNavigate();

  const fetchPublicTrips = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getPublicTrips(1, showAll ? 50 : 12, filters);
      setTrips(response.trips || []);
    } catch (err) {
      console.error('Error fetching public trips:', err);
      setError('Failed to load public trips. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [filters, showAll]);

  useEffect(() => {
    fetchPublicTrips();
  }, [fetchPublicTrips]);

  const handleViewTrip = async (trip) => {
    try {
      setLoading(true);
      const tripDetails = await getPublicTripDetails(trip.trip_id);
      setSelectedTrip(tripDetails);
      setShowTripDetails(true);
    } catch (err) {
      console.error('Error fetching trip details:', err);
      setError('Failed to load trip details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLibrary = () => {
    setShowTripDetails(false);
    setSelectedTrip(null);
  };

  const handleSignUp = () => {
    navigate('/?signup=1');
  };

  const handleSignIn = () => {
    navigate('/?signin=1');
  };

  const handleGoHome = () => {
    navigate('/');
  };

  const filteredTrips = trips.filter(trip => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      trip.destination.toLowerCase().includes(query) ||
      trip.creator_name.toLowerCase().includes(query) ||
      (trip.interests && trip.interests.join(', ').toLowerCase().includes(query))
    );
  });

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getTotalActivities = (itinerary) => {
    if (!itinerary || !Array.isArray(itinerary)) return 0;
    return itinerary.reduce((total, day) => total + (day.activities?.length || 0), 0);
  };

  if (showTripDetails && selectedTrip) {
    return (
      <div className="min-h-screen bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Navigation Buttons */}
          <div className="flex justify-between items-center mb-6">
            <motion.button
              onClick={handleBackToLibrary}
              className="flex items-center space-x-2 text-white/70 hover:text-white transition-colors"
              whileHover={{ x: -5 }}
            >
              <ArrowLeft size={20} />
              <span>Back to Trip Library</span>
            </motion.button>
            
            <motion.button
              onClick={handleGoHome}
              className="flex items-center space-x-2 text-white/70 hover:text-white px-4 py-2 rounded-lg hover:bg-white/10 transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Home size={18} />
              <span>Home</span>
            </motion.button>
          </div>

          {/* Trip Details */}
          <ItineraryDisplay
            tripDetails={selectedTrip}
            onBack={handleBackToLibrary}
            isPublicTrip={true}
          />
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <LoadingSpinner size={48} text="Loading amazing trips..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="bg-black border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Home Button */}
          <div className="flex justify-end mb-4">
            <motion.button
              onClick={handleGoHome}
              className="flex items-center space-x-2 text-white/70 hover:text-white px-4 py-2 rounded-lg hover:bg-white/10 transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Home size={18} />
              <span>Home</span>
            </motion.button>
          </div>
          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="text-center"
          >
            <motion.div variants={fadeInUp} className="flex items-center justify-center space-x-3 mb-6">
              <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/20">
                <Globe size={32} className="text-blue-300" />
              </div>
              <h1 className="text-4xl lg:text-5xl font-semibold text-white">
                Trip Library
              </h1>
            </motion.div>
            <motion.p variants={fadeInUp} className="text-lg text-white/70 max-w-3xl mx-auto mb-8">
              Discover amazing itineraries shared by our community. Get inspired by real trips 
              from fellow travelers around the world.
            </motion.p>
            
            {/* Auth Buttons */}
            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <motion.button
                onClick={handleSignUp}
                className="bg-white text-black hover:bg-white/90 px-6 py-3 rounded-lg font-semibold flex items-center space-x-2 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <UserPlus size={20} />
                <span>Sign Up Free</span>
              </motion.button>
              
              <motion.button
                onClick={handleSignIn}
                className="bg-white/10 text-white hover:bg-white/20 px-6 py-3 rounded-lg font-semibold flex items-center space-x-2 transition-colors border border-white/20"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <LogIn size={20} />
                <span>Sign In</span>
              </motion.button>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Search and Filters */}
        <motion.div
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          className="bg-gray-900 rounded-2xl border border-white/10 p-6 mb-12"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-white/80 mb-2">
                <Search className="inline mr-2" size={16} />
                Search Trips
              </label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:ring-2 focus:ring-white/50 focus:border-white/50"
                placeholder="Search by destination, creator, or interests..."
              />
            </div>

            {/* Budget Filter */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                <DollarSign className="inline mr-2" size={16} />
                Budget
              </label>
              <select
                value={filters.budget}
                onChange={(e) => setFilters({ ...filters, budget: e.target.value })}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:ring-2 focus:ring-white/50 focus:border-white/50"
              >
                <option value="">All Budgets</option>
                <option value="Budget">Budget</option>
                <option value="Mid-range">Mid-range</option>
                <option value="Luxury">Luxury</option>
              </select>
            </div>

            {/* Travel Style Filter */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                <Heart className="inline mr-2" size={16} />
                Travel Style
              </label>
              <select
                value={filters.travel_style}
                onChange={(e) => setFilters({ ...filters, travel_style: e.target.value })}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:ring-2 focus:ring-white/50 focus:border-white/50"
              >
                <option value="">All Styles</option>
                <option value="Relaxation">Relaxation</option>
                <option value="Cultural and Historical">Cultural and Historical</option>
                <option value="Romantic for Couples">Romantic for Couples</option>
                <option value="Family-Friendly">Family-Friendly</option>
                <option value="Adventure and Outdoor">Adventure and Outdoor</option>
                <option value="Food and Culinary">Food and Culinary</option>
                <option value="Nightlife and Entertainment">Nightlife and Entertainment</option>
                <option value="Shopping and Markets">Shopping and Markets</option>
                <option value="Nature and Wildlife">Nature and Wildlife</option>
                <option value="Art and Museums">Art and Museums</option>
                <option value="Business and Professional">Business and Professional</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Error Message */}
        {error && (
          <motion.div
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 mb-8"
          >
            <p className="text-red-300">{error}</p>
          </motion.div>
        )}

        {/* Trips Grid */}
        {filteredTrips.length === 0 ? (
          <motion.div
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            className="text-center py-16"
          >
            <div className="bg-gray-900 rounded-2xl border border-white/10 p-12 max-w-md mx-auto">
              <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Globe size={48} className="text-white/60" />
              </div>
              <h3 className="text-2xl font-semibold text-white mb-4">
                No public trips found
              </h3>
              <p className="text-white/70 mb-8">
                {searchQuery || Object.values(filters).some(filter => filter) 
                  ? "Try adjusting your search or filters to find more trips."
                  : "Be the first to share your amazing itinerary with the community!"
                }
              </p>
              {(!searchQuery && !Object.values(filters).some(filter => filter)) && (
                <motion.button
                  onClick={handleSignUp}
                  className="bg-white text-black hover:bg-white/90 px-6 py-3 rounded-lg font-semibold transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Create Your First Trip
                </motion.button>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {filteredTrips.map((trip, index) => (
              <motion.div
                key={trip.trip_id}
                variants={fadeInUp}
                className="bg-gray-900 rounded-2xl border border-white/10 overflow-hidden hover:border-white/20 transition-all flex flex-col h-full"
              >
                {/* Trip Header */}
                <div className="bg-gray-900 p-6 text-white border-b border-white/10">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1 min-w-0 mr-3">
                      <h3 className="text-xl font-bold mb-1 truncate" title={trip.destination}>{trip.destination}</h3>
                      <div className="flex items-center space-x-2 text-white/60 text-sm">
                        <User size={14} />
                        <span>by {trip.creator_name}</span>
                      </div>
                      <p className="text-white/60 text-sm mt-1">
                        Created {formatDate(trip.created_at)}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <motion.button
                        onClick={() => handleViewTrip(trip)}
                        className="bg-white/20 hover:bg-white/30 p-2 rounded-lg transition-colors"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        title="View Itinerary"
                      >
                        <Eye size={18} />
                      </motion.button>
                    </div>
                  </div>
                </div>

                {/* Trip Details */}
                <div className="p-6 flex-1 flex flex-col">
                  <div className="space-y-4 flex-1">
                    <div className="flex items-center space-x-3">
                      <Calendar size={20} className="text-white/60" />
                      <span className="text-white/70">{trip.duration} days</span>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <DollarSign size={20} className="text-white/60" />
                      <span className="text-white/70">{trip.budget}</span>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <Heart size={20} className="text-white/60" />
                      <span className="text-white/70">
                        {Array.isArray(trip.interests) ? trip.interests.join(', ') : trip.interests}
                      </span>
                    </div>

                    {trip.travel_style && (
                      <div className="flex items-center space-x-3">
                        <Heart size={20} className="text-white/60" />
                        <span className="text-white/70">{trip.travel_style}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center space-x-3">
                      <MapPin size={20} className="text-white/60" />
                      <span className="text-white/70">
                        {getTotalActivities(trip.itinerary)} activities
                      </span>
                    </div>

                    {/* Quick Preview */}
                    {trip.itinerary && trip.itinerary.length > 0 && (
                      <div className="mt-6 pt-6 border-t border-white/10">
                        <h4 className="font-semibold text-white mb-3">Quick Preview</h4>
                        <div className="space-y-2">
                          {trip.itinerary.slice(0, 2).map((day, dayIndex) => (
                            <div key={dayIndex} className="text-sm text-white/70">
                              <span className="font-medium">Day {day.day}:</span> {day.title}
                            </div>
                          ))}
                          {trip.itinerary.length > 2 && (
                            <div className="text-sm text-white/50">
                              +{trip.itinerary.length - 2} more days...
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-6 flex space-x-3">
                    <motion.button
                      onClick={() => handleViewTrip(trip)}
                      className="flex-1 bg-white text-black hover:bg-white/90 py-2 px-4 rounded-lg font-medium transition-colors"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      View Details
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* CTA Section */}
        <motion.div
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          className="text-center mt-16"
        >
          <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl border border-white/10 p-8">
            <h3 className="text-2xl font-semibold text-white mb-4">
              Ready to Create Your Own Trip?
            </h3>
            <p className="text-white/70 mb-6 max-w-2xl mx-auto">
              Join our community and start planning amazing adventures with AI-powered itineraries. 
              Share your trips and inspire others!
            </p>
            <motion.button
              onClick={handleSignUp}
              className="bg-white text-black hover:bg-white/90 px-8 py-4 rounded-xl text-lg font-semibold transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Get Started Free
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default TripLibraryPage;
