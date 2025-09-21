import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Calendar, DollarSign, Heart, CheckCircle, Download, Share, Globe } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import ItineraryDisplay from '../components/ItineraryDisplay';
import Dashboard from '../components/Dashboard';
import TripLibrary from '../components/TripLibrary';
import { auth } from '../firebase';
import { generateItinerary, APIError, getUserData, updateItinerary } from '../lib/api';
import { exportToPDF, shareItinerary } from '../lib/exportUtils';
import { isSessionExpired, startSession, clearSession } from '../lib/session';
import { fadeInUp, staggerContainer } from '../lib/motion';

const App = () => {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [formData, setFormData] = useState({
    destination: '',
    duration: '',
    budget: '',
    interests: '',
    startDate: '',
    endDate: '',
    travelStyle: '',
    isPublic: false
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [showItinerary, setShowItinerary] = useState(false);
  const [showDashboard, setShowDashboard] = useState(true);
  const [showTripLibrary, setShowTripLibrary] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const interestSuggestions = ['culture', 'food', 'nature', 'history', 'art', 'shopping', 'nightlife', 'adventure', 'museums', 'parks'];
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      if (!currentUser) {
        navigate('/');
        return;
      }
      setUser(currentUser);
      
      // Enforce 6-hour session window
      if (isSessionExpired(6)) {
        try { await auth.signOut(); } catch {}
        clearSession();
        navigate('/?expired=1');
        return;
      }
      // If no session info yet (first time after feature), start it now
      startSession();

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
    const { name, value } = e.target;
    let updatedFormData = { ...formData, [name]: value };
    
    // Auto-calculate end date when start date or duration changes
    if (name === 'startDate' && formData.duration) {
      const startDate = new Date(value);
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + parseInt(formData.duration) - 1);
      updatedFormData.endDate = endDate.toISOString().split('T')[0];
    } else if (name === 'duration' && formData.startDate) {
      const startDate = new Date(formData.startDate);
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + parseInt(value) - 1);
      updatedFormData.endDate = endDate.toISOString().split('T')[0];
    }
    
    setFormData(updatedFormData);
    setError('');
  };

  const getInterestsArray = () =>
    (formData.interests || '')
      .split(',')
      .map(i => i.trim())
      .filter(Boolean);

  const toggleInterest = (interest) => {
    const set = new Set(getInterestsArray());
    if (set.has(interest)) set.delete(interest); else set.add(interest);
    const next = Array.from(set).join(', ');
    setFormData({ ...formData, interests: next });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const token = await user.getIdToken();
      const interestsList = formData.interests
        ? formData.interests.split(',').map(item => item.trim()).filter(Boolean)
        : [];
      const response = await generateItinerary({
        destination: formData.destination,
        duration: parseInt(formData.duration),
        budget: formData.budget,
        interests: interestsList,
        start_date: formData.startDate,
        end_date: formData.endDate,
        travel_style: formData.travelStyle,
        is_public: formData.isPublic
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

  const handleSaveItinerary = async (updatedItinerary) => {
    try {
      if (!result?.trip_id) {
        console.error('No trip ID available for saving');
        return;
      }
      
      const token = await user.getIdToken();
      await updateItinerary(result.trip_id, { itinerary: updatedItinerary }, token);
      
      // Update the local state
      setResult({ ...result, itinerary: updatedItinerary });
      console.log('Itinerary saved successfully');
    } catch (error) {
      console.error('Error saving itinerary:', error);
      // The toast will be shown by the ItineraryDisplay component
    }
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
    setShowTripLibrary(false);
    setSelectedTrip(null);
    setResult(null);
  };

  const handleOpenTripLibrary = () => {
    setShowTripLibrary(true);
    setShowDashboard(false);
    setShowItinerary(false);
  };

  const handleBackFromTripLibrary = () => {
    setShowTripLibrary(false);
    setShowDashboard(true);
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
              {user?.photoURL && (
                <img
                  src={user.photoURL}
                  alt={userData?.name || 'User avatar'}
                  className="w-8 h-8 rounded-full border border-white/20"
                  referrerPolicy="no-referrer"
                />
              )}
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
          onOpenTripLibrary={handleOpenTripLibrary}
        />
      ) : showTripLibrary ? (
        <TripLibrary
          onBack={handleBackFromTripLibrary}
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
            <h1 className="text-4xl font-bold text-white mb-4">
              Plan Your Perfect Trip
            </h1>
            <p className="text-xl text-white/70">
              Tell us about your dream destination and we'll create a personalized itinerary just for you.
            </p>
          </motion.div>

          {/* Form */}
          <motion.div variants={fadeInUp} className="bg-black rounded-2xl border border-white/10 p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* First row - 3 columns */}
                <div className="md:col-span-1 lg:col-span-1">
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

                <div className="md:col-span-1 lg:col-span-1">
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

                <div className="md:col-span-2 lg:col-span-1">
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

                {/* Second row - 2 columns for dates */}
                <div className="md:col-span-1 lg:col-span-1">
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    <Calendar className="inline mr-2" size={16} />
                    Start Date
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:ring-2 focus:ring-white/50 focus:border-white/50"
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>

                <div className="md:col-span-1 lg:col-span-1">
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    <Calendar className="inline mr-2" size={16} />
                    End Date
                  </label>
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:ring-2 focus:ring-white/50 focus:border-white/50"
                    min={formData.startDate || new Date().toISOString().split('T')[0]}
                    required
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Automatically calculated based on start date and duration
                  </p>
                </div>

                <div className="md:col-span-2 lg:col-span-1">
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    <Heart className="inline mr-2" size={16} />
                    Travel Style
                  </label>
                  <select
                    name="travelStyle"
                    value={formData.travelStyle}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:ring-2 focus:ring-white/50 focus:border-white/50"
                    required
                  >
                    <option value="">Select travel style</option>
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

                {/* Third row - Full width for interests */}
                <div className="md:col-span-2 lg:col-span-3">
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
                    placeholder="e.g., culture, food, nature, history (optional)"
                  />
                  {/* Compact Suggestions */}
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {interestSuggestions.map((s) => {
                      const selected = getInterestsArray().includes(s);
                      return (
                        <button
                          key={s}
                          type="button"
                          onClick={() => toggleInterest(s)}
                          className={`${selected ? 'bg-white text-black' : 'bg-white/10 text-white'} px-2 py-1 rounded text-xs border border-white/20 hover:border-white/40 transition-colors`}
                        >
                          {s}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Public/Private Toggle */}
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500/20 to-blue-600/20">
                    <Globe size={20} className="text-blue-300" />
                  </div>
                  <div>
                    <h3 className="text-white font-medium">Share with Community</h3>
                    <p className="text-white/60 text-sm">Make this itinerary public in the Trip Library</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="isPublic"
                    checked={formData.isPublic}
                    onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-white/20 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-white/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-white"></div>
                </label>
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
