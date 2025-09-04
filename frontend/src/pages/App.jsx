import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Calendar, DollarSign, Heart, CheckCircle, Download, Share } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import ItineraryDisplay from '../components/ItineraryDisplay';
import Dashboard from '../components/Dashboard';
import { auth } from '../firebase';
import { generateItinerary, APIError, getUserData } from '../lib/api';
import { exportToPDF, shareItinerary } from '../lib/exportUtils';
import { fadeInUp, staggerContainer } from '../lib/motion';

const App = () => {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [formData, setFormData] = useState({
    destination: '',
    duration: '',
    budget: '',
    interests: ''
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [showItinerary, setShowItinerary] = useState(false);
  const [showDashboard, setShowDashboard] = useState(true);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      if (!currentUser) {
        navigate('/');
        return;
      }
      setUser(currentUser);
      
      // Fetch user data from backend
      try {
        const data = await getUserData(currentUser.email);
        setUserData(data);
      } catch (error) {
        console.error('Error fetching user data:', error);
        setUserData({ email: currentUser.email, name: currentUser.displayName || 'User' });
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const token = await user.getIdToken();
      const response = await generateItinerary({
        destination: formData.destination,
        duration: parseInt(formData.duration),
        budget: formData.budget,
        interests: formData.interests.split(',').map(item => item.trim())
      }, token);

      setResult(response);
      setShowItinerary(true);
      setShowDashboard(false);
    } catch (err) {
      if (err instanceof APIError) {
        if (err.status === 401) {
          setError('Authentication failed. Please sign in again.');
          // Redirect to home after a delay
          setTimeout(() => navigate('/'), 2000);
        } else if (err.status === 500) {
          setError('Server error. Please try again later.');
        } else {
          setError(err.message || 'Failed to generate itinerary. Please try again.');
        }
      } else {
        setError('Network error. Please check your connection and try again.');
      }
      console.error('Itinerary generation error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveItinerary = (updatedItinerary) => {
    // Here you could save the updated itinerary to the backend
    console.log('Saving updated itinerary:', updatedItinerary);
    // For now, just update the local state
    setResult({ ...result, itinerary: updatedItinerary });
  };

  const handleExportPDF = (itinerary, tripDetails) => {
    exportToPDF(itinerary, tripDetails);
  };

  const handleShareItinerary = (itinerary, tripDetails) => {
    shareItinerary(itinerary, tripDetails);
  };

  const handleNewTrip = () => {
    setShowDashboard(false);
    setShowItinerary(false);
    setResult(null);
    setError('');
  };

  const handleViewTrip = (trip) => {
    setSelectedTrip(trip);
    setResult({
      trip_id: trip.trip_id,
      itinerary_id: trip.itinerary_id,
      itinerary: trip.itinerary,
      trip_details: {
        destination: trip.destination,
        duration: trip.duration,
        budget: trip.budget,
        interests: trip.interests
      }
    });
    setShowItinerary(true);
    setShowDashboard(false);
  };

  const handleEditTrip = (trip) => {
    // For now, just view the trip. In the future, you could implement editing
    handleViewTrip(trip);
  };

  const handleDeleteTrip = (trip) => {
    // For now, just show an alert. In the future, you could implement deletion
    alert('Delete functionality will be implemented soon!');
  };

  const handleBackToDashboard = () => {
    setShowDashboard(true);
    setShowItinerary(false);
    setResult(null);
    setSelectedTrip(null);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size={48} text="Authenticating..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <motion.header
        variants={fadeInUp}
        initial="initial"
        animate="animate"
        className="bg-black/80 backdrop-blur-md border-b border-white/10"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {!showDashboard && (
              <motion.button
                onClick={handleBackToDashboard}
                className="flex items-center space-x-2 text-gray-600 hover:text-primary-600 transition-colors"
                whileHover={{ scale: 1.05 }}
              >
                <ArrowLeft size={20} />
                <span>Back to Dashboard</span>
              </motion.button>
            )}
            
            <div className="flex items-center space-x-4">
              <span className="text-white/80">Welcome, {userData?.name || user?.email}</span>
              <motion.button
                onClick={() => auth.signOut()}
                className="bg-white text-black px-4 py-2 rounded-lg hover:bg-white/90 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Sign Out
              </motion.button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      {showDashboard ? (
        <Dashboard
          user={user}
          onNewTrip={handleNewTrip}
          onViewTrip={handleViewTrip}
          onEditTrip={handleEditTrip}
          onDeleteTrip={handleDeleteTrip}
        />
      ) : (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="space-y-8"
          >
          {/* Title */}
          <motion.div variants={fadeInUp} className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Plan Your Perfect Trip
            </h1>
            <p className="text-xl text-gray-600">
              Tell us about your dream destination and we'll create a personalized itinerary just for you.
            </p>
          </motion.div>

          {/* Form */}
          <motion.div variants={fadeInUp} className="bg-black rounded-2xl border border-white/10 p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    <MapPin className="inline mr-2" size={16} />
                    Destination
                  </label>
                  <input
                    type="text"
                    name="destination"
                    value={formData.destination}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:ring-2 focus:ring-white/50 focus:border-white/50"
                    placeholder="e.g., Tokyo, Japan"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    <Calendar className="inline mr-2" size={16} />
                    Duration (days)
                  </label>
                  <input
                    type="number"
                    name="duration"
                    value={formData.duration}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:ring-2 focus:ring-white/50 focus:border-white/50"
                    placeholder="e.g., 7"
                    min="1"
                    max="30"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    <DollarSign className="inline mr-2" size={16} />
                    Budget
                  </label>
                  <select
                    name="budget"
                    value={formData.budget}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:ring-2 focus:ring-white/50 focus:border-white/50"
                    required
                  >
                    <option value="">Select budget range</option>
                    <option value="Budget">Budget ($0-50/day)</option>
                    <option value="Mid-range">Mid-range ($50-150/day)</option>
                    <option value="Luxury">Luxury ($150+/day)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    <Heart className="inline mr-2" size={16} />
                    Interests
                  </label>
                  <input
                    type="text"
                    name="interests"
                    value={formData.interests}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:ring-2 focus:ring-white/50 focus:border-white/50"
                    placeholder="e.g., culture, food, nature, history"
                    required
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Separate multiple interests with commas
                  </p>
                </div>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-900/20 border border-red-500/30 text-red-300 px-4 py-3 rounded-lg"
                >
                  {error}
                </motion.div>
              )}

              <motion.button
                type="submit"
                disabled={loading}
                className="w-full bg-white text-black py-4 rounded-lg font-semibold text-lg hover:bg-white/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                whileHover={{ scale: loading ? 1 : 1.02 }}
                whileTap={{ scale: loading ? 1 : 0.98 }}
              >
                {loading ? (
                  <>
                    <LoadingSpinner size={20} text="" />
                    <span>Generating Your Itinerary...</span>
                  </>
                ) : (
                  <span>Generate My Itinerary</span>
                )}
              </motion.button>
            </form>
          </motion.div>

          {/* Results */}
          {result && showItinerary && (
            <motion.div
              variants={fadeInUp}
              initial="initial"
              animate="animate"
              className="bg-black rounded-2xl border border-white/10 p-8"
            >
              <div className="flex items-center space-x-3 mb-6">
                <CheckCircle className="text-green-600" size={32} />
                <div>
                  <h2 className="text-2xl font-semibold text-white">
                    Itinerary Generated Successfully!
                  </h2>
                  <p className="text-white/70">
                    Your personalized travel plan has been created and saved.
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white/5 p-4 rounded-lg">
                  <h3 className="font-semibold text-white mb-2">Trip ID</h3>
                  <p className="text-white/70 font-mono text-sm">{result.trip_id}</p>
                </div>
                <div className="bg-white/5 p-4 rounded-lg">
                  <h3 className="font-semibold text-white mb-2">Itinerary ID</h3>
                  <p className="text-white/70 font-mono text-sm">{result.itinerary_id}</p>
                </div>
              </div>

              {/* Display Itinerary with Editing Capabilities */}
              {result.itinerary && result.trip_details && (
                <ItineraryDisplay
                  itinerary={result.itinerary}
                  tripDetails={result.trip_details}
                  onSave={handleSaveItinerary}
                  onExport={handleExportPDF}
                  onShare={handleShareItinerary}
                />
              )}
            </motion.div>
          )}
        </motion.div>
        </div>
      )}
    </div>
  );
};

export default App;
