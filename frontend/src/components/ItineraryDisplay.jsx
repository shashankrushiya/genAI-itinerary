import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  DollarSign, 
  Edit3, 
  Trash2, 
  Plus, 
  Save, 
  X,
  Download,
  Share2,
  Heart,
} from 'lucide-react';
import { Sun, Cloud, CloudRain, CloudSnow, CloudDrizzle, CloudFog, CloudLightning, CloudSun, Plane } from 'lucide-react';
import { fadeInUp, staggerContainer } from '../lib/motion';
import LoadingSpinner from './LoadingSpinner';
import InteractiveMap from './InteractiveMap';
import { getLiveConstraints, searchImages } from '../lib/api';

// Simple in-memory cache to dedupe image lookups across renders
const imageCache = new Map();

const ItineraryDisplay = ({ itinerary, tripDetails, onSave, onExport, onShare }) => {
  const [editableItinerary, setEditableItinerary] = useState(itinerary || []);
  const [editingDay, setEditingDay] = useState(null);
  const [editingActivity, setEditingActivity] = useState(null);
  const [newActivity, setNewActivity] = useState({ name: '', description: '', estimated_cost: '' });
  const [showAddActivity, setShowAddActivity] = useState({});
  const [constraints, setConstraints] = useState(null);
  const [constraintsLoading, setConstraintsLoading] = useState(false);
  const [constraintsError, setConstraintsError] = useState('');
  const [showMap, setShowMap] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const showToastMessage = (message) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  };

  const handleEditDay = (dayIndex) => {
    setEditingDay(editingDay === dayIndex ? null : dayIndex);
  };

  const handleSaveDay = (dayIndex, updatedDay) => {
    const updatedItinerary = [...editableItinerary];
    updatedItinerary[dayIndex] = { ...updatedItinerary[dayIndex], ...updatedDay };
    setEditableItinerary(updatedItinerary);
    setEditingDay(null);
  };

  const toggleAddActivity = (dayIndex) => {
    setShowAddActivity(prev => ({
      ...prev,
      [dayIndex]: !prev[dayIndex]
    }));
  };

  const handleEditActivity = (dayIndex, activityIndex) => {
    setEditingActivity({ dayIndex, activityIndex });
  };

  const handleDeleteActivity = (dayIndex, activityIndex) => {
    const updatedItinerary = [...editableItinerary];
    updatedItinerary[dayIndex].activities.splice(activityIndex, 1);
    setEditableItinerary(updatedItinerary);
  };

  const handleAddActivity = (dayIndex) => {
    if (newActivity.name.trim()) {
      const updatedItinerary = [...editableItinerary];
      updatedItinerary[dayIndex].activities.push({ ...newActivity });
      setEditableItinerary(updatedItinerary);
      setNewActivity({ name: '', description: '', estimated_cost: '' });
      setShowAddActivity(prev => ({ ...prev, [dayIndex]: false }));
    }
  };

  const handleSaveActivity = (dayIndex, activityIndex, updatedActivity) => {
    const updatedItinerary = [...editableItinerary];
    updatedItinerary[dayIndex].activities[activityIndex] = updatedActivity;
    setEditableItinerary(updatedItinerary);
    setEditingActivity(null);
  };

  const handleSaveItinerary = () => {
    if (onSave) {
      onSave(editableItinerary);
      showToastMessage('Itinerary saved successfully!');
    }
  };

  const handleLocationUpdate = (dayIndex, activityIndex, newLocation) => {
    const updatedItinerary = [...editableItinerary];
    if (updatedItinerary[dayIndex] && updatedItinerary[dayIndex].activities[activityIndex]) {
      updatedItinerary[dayIndex].activities[activityIndex].location = newLocation;
      setEditableItinerary(updatedItinerary);
    }
  };

  const handleExportPDF = () => {
    if (onExport) {
      onExport(editableItinerary, tripDetails);
    }
  };

  const handleShareItinerary = () => {
    if (onShare) {
      onShare(editableItinerary, tripDetails);
    }
  };

  // -------- Activity Images (Unsplash Source) --------

  const getActivityImageFallback = (name = '') => {
    return `https://placehold.co/192x192?text=${encodeURIComponent(name || 'Activity')}`;
  };

  // Animated thumbnail with skeleton + hover effects
  const ActivityThumbnail = ({ name, destination }) => {
    const [src, setSrc] = useState(null);
    const [loaded, setLoaded] = useState(false);
    const fallback = getActivityImageFallback(name);

    useEffect(() => {
      let canceled = false;
      const query = `${destination || ''} ${name || ''}`.trim() || 'travel';
      // Use cache first to avoid duplicate requests and rate limits
      const cached = imageCache.get(query);
      if (cached) {
        setSrc(cached);
        return () => { canceled = true; };
      }
      async function fetchImage() {
        try {
          const data = await searchImages(query, 1);
          const url = data?.photos?.[0]?.url;
          if (!canceled) {
            const chosen = url || // Pexels success
              `https://source.unsplash.com/480x320/?${encodeURIComponent(query)}` || // fallback (no key)
              fallback; // final fallback
            imageCache.set(query, chosen);
            setSrc(chosen);
          }
        } catch (e) {
          if (!canceled) setSrc(`https://source.unsplash.com/480x320/?${encodeURIComponent(query)}`);
        }
      }
      fetchImage();
      return () => { canceled = true; };
    }, [name, destination, fallback]);

    return (
      <motion.div
        className="relative w-56 h-36 md:w-64 md:h-40 rounded-xl overflow-hidden border border-white/10 bg-white/5 shadow-[0_0_20px_rgba(59,130,246,0.1)]"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.03 }}
        transition={{ duration: 0.25 }}
      >
        {!loaded && (
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-white/5 animate-pulse" />
        )}
        {src && (
          <img
            src={src}
            alt={name}
            loading="lazy"
            className={`absolute inset-0 w-full h-full object-cover ${loaded ? 'opacity-100' : 'opacity-0'}`}
            referrerPolicy="no-referrer"
            crossOrigin="anonymous"
            onLoad={() => setLoaded(true)}
            onError={() => { setSrc(fallback); setLoaded(true); }}
          />
        )}
        {/* Soft glow border */}
        <div className="pointer-events-none absolute inset-0 ring-1 ring-white/10 rounded-xl" />
      </motion.div>
    );
  };

  // -------- Flight detection (for EaseMyTrip CTA) --------
  const isFlightRelatedText = (text = '') => {
    if (!text) return false;
    return /(\bflight\b|\bfly\b|\bairport\b|\bairline\b|\bplane\b|\bterminal\b|\bboarding\b|\bdeparture\b|\barrival\b)/i.test(text);
  };

  const dayHasFlight = (day) => {
    const acts = day?.activities || [];
    return acts.some(a => isFlightRelatedText(a?.name) || isFlightRelatedText(a?.description));
  };

  const easeMyTripUrl = 'https://www.easemytrip.com/flights.html?utm_source=gen-itinerary&utm_medium=referral&utm_campaign=flight-cta';

  // -------- Weather icon mapping --------
  const WeatherIcon = ({ weather }) => {
    if (!weather) return null;
    const s = (weather.summary || '').toLowerCase();
    let Icon = Cloud;
    if (s.includes('clear')) Icon = Sun;
    else if (s.includes('partly')) Icon = CloudSun;
    else if (s.includes('thunder')) Icon = CloudLightning;
    else if (s.includes('snow')) Icon = CloudSnow;
    else if (s.includes('drizzle')) Icon = CloudDrizzle;
    else if (s.includes('rain') || s.includes('shower')) Icon = CloudRain;
    else if (s.includes('fog')) Icon = CloudFog;
    else if (s.includes('overcast') || s.includes('cloud')) Icon = Cloud;

    return (
      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-white/10 mr-2">
        <Icon size={16} className="text-white/80" />
      </span>
    );
  };

  // Fetch live constraints when trip details change
  useEffect(() => {
    let canceled = false;
    async function loadConstraints() {
      if (!tripDetails?.destination || !tripDetails?.duration) return;
      try {
        setConstraintsLoading(true);
        setConstraintsError('');
        const data = await getLiveConstraints(tripDetails.destination, tripDetails.duration, tripDetails.start_date);
        if (!canceled) setConstraints(data);
      } catch (e) {
        if (!canceled) setConstraintsError('Unable to load live updates right now.');
      } finally {
        if (!canceled) setConstraintsLoading(false);
      }
    }
    loadConstraints();
    return () => {
      canceled = true;
    };
  }, [tripDetails?.destination, tripDetails?.duration, tripDetails?.start_date]);

  // Enhanced cost formatting for better readability
  const formatCost = (cost) => {
    if (!cost) return { symbol: '$', amount: '0' };
    const str = String(cost).trim();
    
    // Extract currency symbol and amount, handling multiple symbols
    const currencyMatch = str.match(/^([$¥€£]+)\s*(.+)$/);
    if (currencyMatch) {
      const [, symbols, amount] = currencyMatch;
      // Take only the first currency symbol to avoid duplicates
      const symbol = symbols[0];
      return { symbol, amount: amount.trim() };
    }
    
    // If no currency symbol, assume USD
    return { symbol: '$', amount: str };
  };


  // Calculate daily cost summary
  const getDailyCostSummary = (day) => {
    if (!day.activities || day.activities.length === 0) return null;
    
    const costs = day.activities
      .map(activity => activity.estimated_cost)
      .filter(cost => cost && cost.trim())
      .map(cost => {
        const formatted = formatCost(cost);
        const amount = parseFloat(formatted.amount.replace(/[^\d.-]/g, ''));
        return { symbol: formatted.symbol, amount: isNaN(amount) ? 0 : amount };
      });
    
    if (costs.length === 0) return null;
    
    // Group by currency
    const currencyGroups = costs.reduce((acc, cost) => {
      if (!acc[cost.symbol]) acc[cost.symbol] = 0;
      acc[cost.symbol] += cost.amount;
      return acc;
    }, {});
    
    return Object.entries(currencyGroups).map(([symbol, total]) => ({
      symbol,
      total: Math.round(total * 100) / 100
    }));
  };

  // Whether any day appears flight-related
  const showFlightCTA = Array.isArray(editableItinerary) && editableItinerary.some(dayHasFlight);

  return (
    <div className="w-full max-w-7xl mx-auto p-3 sm:p-4 lg:p-6">
      {/* Header with Trip Details */}
      <motion.div
        variants={fadeInUp}
        initial="initial"
        animate="animate"
        className="bg-black rounded-2xl p-4 sm:p-6 lg:p-8 text-white mb-6 border border-white/10 overflow-hidden"
      >
        {/* Header Section */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500/20 to-emerald-500/20 border border-blue-400/30 flex-shrink-0">
              <Calendar size={18} className="text-blue-300" />
            </div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white leading-tight">Your Personalized Itinerary</h2>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-white/70">
            <span className="px-3 py-1.5 bg-white/10 rounded-full text-sm font-medium max-w-[200px] truncate" title={tripDetails?.destination}>{tripDetails?.destination}</span>
            <span className="text-white/50 text-sm">•</span>
            <span className="px-3 py-1.5 bg-white/10 rounded-full text-sm font-medium">{tripDetails?.duration} days</span>
            <span className="text-white/50 text-sm">•</span>
            <span className="px-3 py-1.5 bg-white/10 rounded-full text-sm font-medium max-w-[150px] truncate" title={tripDetails?.budget}>{tripDetails?.budget}</span>
          </div>
        </div>
        
        {/* Trip Details - Clean Card Layout */}
        <div className="space-y-4 mb-6">
          {/* First Row - Destination & Duration */}
          <div className="flex flex-col sm:flex-row gap-4">
            <motion.div 
              className="flex-1 group flex items-center space-x-4 p-5 rounded-xl bg-gradient-to-br from-white/5 to-white/10 border border-white/10 hover:border-white/20 transition-all duration-300 cursor-pointer"
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="p-3 rounded-lg bg-gradient-to-br from-blue-500/20 to-blue-600/20 group-hover:from-blue-400/30 group-hover:to-blue-500/30 transition-all duration-300 flex-shrink-0">
                <MapPin size={20} className="text-blue-300" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-white/60 uppercase tracking-wide font-medium mb-1">Destination</p>
                <p className="text-base font-semibold text-white group-hover:text-blue-300 transition-colors duration-300 leading-tight truncate" title={tripDetails?.destination}>{tripDetails?.destination}</p>
              </div>
            </motion.div>
            
            <motion.div 
              className="flex-1 group flex items-center space-x-4 p-5 rounded-xl bg-gradient-to-br from-white/5 to-white/10 border border-white/10 hover:border-white/20 transition-all duration-300 cursor-pointer"
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="p-3 rounded-lg bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 group-hover:from-emerald-400/30 group-hover:to-emerald-500/30 transition-all duration-300 flex-shrink-0">
                <Calendar size={20} className="text-emerald-300" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-white/60 uppercase tracking-wide font-medium mb-1">Duration</p>
                <p className="text-base font-semibold text-white group-hover:text-emerald-300 transition-colors duration-300 leading-tight">{tripDetails?.duration} days</p>
              </div>
            </motion.div>
          </div>

          {/* Second Row - Budget & Travel Style */}
          <div className="flex flex-col sm:flex-row gap-4">
            <motion.div 
              className="flex-1 group flex items-center space-x-4 p-5 rounded-xl bg-gradient-to-br from-white/5 to-white/10 border border-white/10 hover:border-white/20 transition-all duration-300 cursor-pointer"
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="p-3 rounded-lg bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 group-hover:from-yellow-400/30 group-hover:to-yellow-500/30 transition-all duration-300 flex-shrink-0">
                <DollarSign size={20} className="text-yellow-300" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-white/60 uppercase tracking-wide font-medium mb-1">Budget</p>
                <p className="text-base font-semibold text-white group-hover:text-yellow-300 transition-colors duration-300 leading-tight truncate" title={tripDetails?.budget}>{tripDetails?.budget}</p>
              </div>
            </motion.div>
            
            <motion.div 
              className="flex-1 group flex items-center space-x-4 p-5 rounded-xl bg-gradient-to-br from-white/5 to-white/10 border border-white/10 hover:border-white/20 transition-all duration-300 cursor-pointer"
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="p-3 rounded-lg bg-gradient-to-br from-pink-500/20 to-pink-600/20 group-hover:from-pink-400/30 group-hover:to-pink-500/30 transition-all duration-300 flex-shrink-0">
                <Heart size={20} className="text-pink-300" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-white/60 uppercase tracking-wide font-medium mb-1">Travel Style</p>
                <p className="text-base font-semibold text-white group-hover:text-pink-300 transition-colors duration-300 leading-tight truncate" title={tripDetails?.travel_style}>{tripDetails?.travel_style}</p>
              </div>
            </motion.div>
          </div>

          {/* Third Row - Interests (Full Width) */}
          <motion.div 
            className="group flex items-center space-x-4 p-5 rounded-xl bg-gradient-to-br from-white/5 to-white/10 border border-white/10 hover:border-white/20 transition-all duration-300 cursor-pointer"
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="p-3 rounded-lg bg-gradient-to-br from-purple-500/20 to-purple-600/20 group-hover:from-purple-400/30 group-hover:to-purple-500/30 transition-all duration-300 flex-shrink-0">
              <Clock size={20} className="text-purple-300" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-white/60 uppercase tracking-wide font-medium mb-1">Interests</p>
              <p className="text-base font-semibold text-white group-hover:text-purple-300 transition-colors duration-300 leading-tight" title={tripDetails?.interests?.join(', ')}>
                {tripDetails?.interests && tripDetails.interests.length > 0 
                  ? tripDetails.interests.join(', ')
                  : 'No specific interests'
                }
              </p>
            </div>
          </motion.div>
        </div>

        {/* Prominent Flight Booking CTA */}
        {showFlightCTA && (
          <motion.div
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            className="bg-gradient-to-r from-blue-600/20 to-blue-700/20 border border-blue-500/40 rounded-xl p-6 mb-6 overflow-hidden relative"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-blue-600/5" />
            <div className="relative flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center space-x-4">
                <div className="bg-blue-500/30 p-3 rounded-xl">
                  <Plane className="text-blue-200" size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-blue-100 mb-1">Ready to Book Your Flights?</h3>
                  <p className="text-blue-200/80 text-sm">Get exclusive discounts and deals with EaseMyTrip for your {tripDetails?.destination} trip</p>
                </div>
              </div>
              <a
                href={easeMyTripUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg text-sm font-semibold transition-all duration-300 hover:scale-105 flex items-center space-x-2"
              >
                <Plane size={16} />
                <span>Book Flights Now</span>
              </a>
            </div>
          </motion.div>
        )}

        {/* Action Buttons - Clean Layout */}
        <div className="pt-6 border-t border-white/10">
          <div className="text-center mb-6">
            <h3 className="text-lg font-semibold text-white mb-2">Quick Actions</h3>
            <p className="text-sm text-white/60">Manage your itinerary</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <motion.button
              onClick={() => setShowMap(!showMap)}
              className={`flex-1 group flex items-center space-x-3 p-4 rounded-xl transition-all duration-300 ${
                showMap 
                  ? 'bg-gradient-to-br from-blue-500/20 to-blue-600/20 border-2 border-blue-400/40 text-blue-300 hover:from-blue-400/30 hover:to-blue-500/30' 
                  : 'bg-gradient-to-br from-white/5 to-white/10 border border-white/20 text-white hover:border-white/30 hover:from-white/10 hover:to-white/15'
              }`}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className={`p-2 rounded-lg transition-all duration-300 ${
                showMap ? 'bg-blue-500/30' : 'bg-white/10 group-hover:bg-white/20'
              }`}>
                <MapPin size={18} />
              </div>
              <div className="text-left">
                <p className="font-semibold text-sm">{showMap ? 'Hide Map' : 'Show Map'}</p>
                <p className="text-xs opacity-70">{showMap ? 'Hide interactive map' : 'View interactive map'}</p>
              </div>
            </motion.button>
            
            <motion.button
              onClick={handleSaveItinerary}
              className="flex-1 group flex items-center space-x-3 p-4 rounded-xl bg-gradient-to-br from-white/5 to-white/10 border border-white/20 text-white hover:border-white/30 hover:from-white/10 hover:to-white/15 transition-all duration-300"
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="p-2 rounded-lg bg-white/10 group-hover:bg-white/20 transition-all duration-300">
                <Save size={18} />
              </div>
              <div className="text-left">
                <p className="font-semibold text-sm">Save Changes</p>
                <p className="text-xs opacity-70">Update itinerary</p>
              </div>
            </motion.button>
            
            <motion.button
              onClick={handleExportPDF}
              className="flex-1 group flex items-center space-x-3 p-4 rounded-xl bg-gradient-to-br from-white/5 to-white/10 border border-white/20 text-white hover:border-white/30 hover:from-white/10 hover:to-white/15 transition-all duration-300"
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="p-2 rounded-lg bg-white/10 group-hover:bg-white/20 transition-all duration-300">
                <Download size={18} />
              </div>
              <div className="text-left">
                <p className="font-semibold text-sm">Export PDF</p>
                <p className="text-xs opacity-70">Download copy</p>
              </div>
            </motion.button>
            
            <motion.button
              onClick={handleShareItinerary}
              className="flex-1 group flex items-center space-x-3 p-4 rounded-xl bg-gradient-to-br from-white/5 to-white/10 border border-white/20 text-white hover:border-white/30 hover:from-white/10 hover:to-white/15 transition-all duration-300"
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="p-2 rounded-lg bg-white/10 group-hover:bg-white/20 transition-all duration-300">
                <Share2 size={18} />
              </div>
              <div className="text-left">
                <p className="font-semibold text-sm">Share Trip</p>
                <p className="text-xs opacity-70">Send to friends</p>
              </div>
            </motion.button>
          </div>
        </div>
      </motion.div>


      {/* Interactive Map */}
      {showMap && (
        <motion.div
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          className="bg-black rounded-xl p-4 sm:p-6 mb-6 border border-white/10 overflow-hidden"
        >
          <h3 className="text-lg sm:text-xl font-semibold text-white mb-4">Interactive Map</h3>
          <InteractiveMap
            itinerary={editableItinerary}
            tripDetails={tripDetails}
            onLocationUpdate={handleLocationUpdate}
          />
        </motion.div>
      )}

      {/* Live Constraints */}
      <motion.div
        variants={fadeInUp}
        initial="initial"
        animate="animate"
        className="bg-black rounded-xl p-4 sm:p-6 text-white mb-6 border border-white/10 overflow-hidden"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg sm:text-xl font-semibold">Live Updates</h3>
          {constraintsLoading && <LoadingSpinner size={20} text="" />}
        </div>
        {!constraintsLoading && constraintsError && (
          <p className="text-red-300 text-sm sm:text-base">{constraintsError}</p>
        )}
        {!constraintsLoading && constraints && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {constraints.days.map((d) => (
              <div key={d.day} className="bg-white/5 rounded-lg p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                  <span className="text-white/80 font-medium text-sm sm:text-base">Day {d.day}</span>
                  {d.weather && (
                    <div className="flex items-center text-white/70 text-xs sm:text-sm min-w-0">
                      <WeatherIcon weather={d.weather} />
                      <span className="truncate ml-2">
                        {d.weather.summary} • {d.weather.low_c}–{d.weather.high_c}°C • {d.weather.precip_prob}% rain
                      </span>
                    </div>
                  )}
                </div>
                {d.events && d.events.length > 0 && (
                  <div className="text-white/70 text-xs sm:text-sm break-words">
                    <span className="font-medium">Events:</span> {d.events.map(e => e.name).join(', ')}
                  </div>
                )}
                {d.alerts && d.alerts.length > 0 && (
                  <div className="text-red-300 text-xs sm:text-sm mt-2 break-words">
                    <span className="font-medium">Alerts:</span> {d.alerts.join(', ')}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Itinerary Days */}
      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="space-y-4"
      >
        {editableItinerary.map((day, dayIndex) => (
          <motion.div
            key={dayIndex}
            variants={fadeInUp}
            className="bg-black rounded-xl border border-white/10 overflow-hidden mb-4"
          >
            {/* Day Header */}
            <div className="bg-black p-4 sm:p-6 border-b border-white/10">
              <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
                <div className="flex items-center space-x-3 sm:space-x-4 min-w-0 flex-1">
                  <div className="bg-white text-black w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center font-bold text-base sm:text-lg flex-shrink-0">
                    {day.day}
                  </div>
                  <div className="min-w-0 flex-1">
                    {editingDay === dayIndex ? (
                      <EditDayForm
                        day={day}
                        onSave={(updatedDay) => handleSaveDay(dayIndex, updatedDay)}
                        onCancel={() => setEditingDay(null)}
                      />
                    ) : (
                      <>
                        <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold text-white truncate">{day.title}</h3>
                        <div className="flex items-center justify-between">
                          <p className="text-white/60 text-sm sm:text-base">Day {day.day} of your adventure</p>
                          {getDailyCostSummary(day) && (
                            <div className="flex items-center space-x-1 bg-green-500/10 px-2 py-1 rounded-md border border-green-500/20">
                              <span className="text-green-400 font-medium text-xs">
                                {getDailyCostSummary(day).map(cost => {
                                  // Ensure no duplicate currency symbols
                                  const symbol = cost.symbol;
                                  const amount = cost.total.toString();
                                  return `${symbol}${amount}`;
                                }).join(', ')}
                              </span>
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 lg:flex-nowrap">
                  <motion.button
                    onClick={() => handleEditDay(dayIndex)}
                    className="bg-white/10 hover:bg-white/20 text-white px-3 py-2 rounded-lg flex items-center space-x-1.5 transition-colors text-sm"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Edit3 size={14} />
                    <span className="hidden sm:inline">{editingDay === dayIndex ? 'Cancel' : 'Edit Day'}</span>
                    <span className="sm:hidden">{editingDay === dayIndex ? 'Cancel' : 'Edit'}</span>
                  </motion.button>
                  <motion.button
                    onClick={() => toggleAddActivity(dayIndex)}
                    className="bg-green-100 hover:bg-green-200 text-green-600 px-3 py-2 rounded-lg flex items-center space-x-1.5 transition-colors text-sm"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Plus size={14} />
                    <span className="hidden sm:inline">Add Activity</span>
                    <span className="sm:hidden">Add</span>
                  </motion.button>
                </div>
              </div>
            </div>

            {/* Activities */}
            <div className="p-4 sm:p-6">
              <div className="space-y-4">
                {day.activities.map((activity, activityIndex) => (
                  <div key={activityIndex} className="bg-white/5 rounded-lg p-4 sm:p-5">
                    {editingActivity?.dayIndex === dayIndex && editingActivity?.activityIndex === activityIndex ? (
                      <EditActivityForm
                        activity={activity}
                        onSave={(updatedActivity) => handleSaveActivity(dayIndex, activityIndex, updatedActivity)}
                        onCancel={() => setEditingActivity(null)}
                      />
                    ) : (
                      <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                        {/* Activity Image */}
                        <div className="flex-shrink-0">
                          <ActivityThumbnail name={activity.name} destination={tripDetails?.destination} />
                        </div>
                        
                        {/* Text Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <h4 className="font-semibold text-white text-base sm:text-lg leading-tight break-words">{activity.name}</h4>
                            <div className="flex items-center space-x-1 flex-shrink-0">
                              <motion.button
                                onClick={() => handleEditActivity(dayIndex, activityIndex)}
                                className="text-white/80 hover:text-white p-1.5 rounded hover:bg-white/10 transition-colors"
                                whileHover={{ scale: 1.1 }}
                              >
                                <Edit3 size={14} />
                              </motion.button>
                              <motion.button
                                onClick={() => handleDeleteActivity(dayIndex, activityIndex)}
                                className="text-red-600 hover:text-red-700 p-1.5 rounded hover:bg-red-500/10 transition-colors"
                                whileHover={{ scale: 1.1 }}
                              >
                                <Trash2 size={14} />
                              </motion.button>
                            </div>
                          </div>
                          <p className="text-white/70 mb-3 text-sm sm:text-base leading-relaxed break-words">{activity.description}</p>
                          {activity.estimated_cost && (
                            <div className="flex items-center space-x-1">
                              <span className="text-green-400 font-medium text-sm">
                                {formatCost(activity.estimated_cost).symbol}{formatCost(activity.estimated_cost).amount}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {/* Add New Activity Dropdown */}
                {showAddActivity[dayIndex] && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-white/5 border-2 border-dashed border-white/20 rounded-lg p-4"
                  >
                    <h5 className="font-semibold text-white mb-3 text-sm sm:text-base">Add New Activity</h5>
                    <div className="space-y-3">
                      <input
                        type="text"
                        placeholder="Activity name"
                        value={newActivity.name}
                        onChange={(e) => setNewActivity({ ...newActivity, name: e.target.value })}
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:ring-2 focus:ring-white/50 focus:border-white/50 text-sm sm:text-base"
                      />
                      <textarea
                        placeholder="Description"
                        value={newActivity.description}
                        onChange={(e) => setNewActivity({ ...newActivity, description: e.target.value })}
                        rows={3}
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:ring-2 focus:ring-white/50 focus:border-white/50 text-sm sm:text-base resize-none"
                      />
                      <input
                        type="text"
                        placeholder="Estimated cost (optional)"
                        value={newActivity.estimated_cost}
                        onChange={(e) => setNewActivity({ ...newActivity, estimated_cost: e.target.value })}
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:ring-2 focus:ring-white/50 focus:border-white/50 text-sm sm:text-base"
                      />
                      <div className="flex flex-wrap gap-2">
                        <motion.button
                          onClick={() => handleAddActivity(dayIndex)}
                          className="bg-white text-black hover:bg-white/90 px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors text-sm"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Plus size={14} />
                          <span>Add Activity</span>
                        </motion.button>
                        <motion.button
                          onClick={() => toggleAddActivity(dayIndex)}
                          className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <X size={16} />
                          <span>Cancel</span>
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Toast Notification */}
      {showToast && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.3 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.3 }}
          className="fixed bottom-6 right-6 z-50 bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg border border-green-400/30 flex items-center space-x-3"
        >
          <div className="w-6 h-6 bg-green-400 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
          <span className="font-medium">{toastMessage}</span>
        </motion.div>
      )}
    </div>
  );
};

// Edit Activity Form Component
const EditActivityForm = ({ activity, onSave, onCancel }) => {
  const [editedActivity, setEditedActivity] = useState(activity);

  const handleSave = () => {
    onSave(editedActivity);
  };

  return (
    <div className="space-y-3">
      <input
        type="text"
        value={editedActivity.name}
        onChange={(e) => setEditedActivity({ ...editedActivity, name: e.target.value })}
        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:ring-2 focus:ring-white/50 focus:border-white/50"
      />
      <input
        type="text"
        value={editedActivity.description}
        onChange={(e) => setEditedActivity({ ...editedActivity, description: e.target.value })}
        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:ring-2 focus:ring-white/50 focus:border-white/50"
      />
      <input
        type="text"
        value={editedActivity.estimated_cost || ''}
        onChange={(e) => setEditedActivity({ ...editedActivity, estimated_cost: e.target.value })}
        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:ring-2 focus:ring-white/50 focus:border-white/50"
        placeholder="Estimated cost"
      />
      <div className="flex space-x-2">
        <motion.button
          onClick={handleSave}
          className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded flex items-center space-x-1 text-sm"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Save size={14} />
          <span>Save</span>
        </motion.button>
        <motion.button
          onClick={onCancel}
          className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded flex items-center space-x-1 text-sm"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <X size={14} />
          <span>Cancel</span>
        </motion.button>
      </div>
    </div>
  );
};

// Edit Day Form Component
const EditDayForm = ({ day, onSave, onCancel }) => {
  const [editedDay, setEditedDay] = useState(day);

  const handleSave = () => {
    onSave(editedDay);
  };

  return (
    <div className="space-y-3">
      <input
        type="text"
        value={editedDay.title}
        onChange={(e) => setEditedDay({ ...editedDay, title: e.target.value })}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-xl font-bold"
        placeholder="Day title"
      />
      <div className="flex space-x-2">
        <motion.button
          onClick={handleSave}
          className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded flex items-center space-x-1 text-sm"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Save size={14} />
          <span>Save</span>
        </motion.button>
        <motion.button
          onClick={onCancel}
          className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded flex items-center space-x-1 text-sm"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <X size={14} />
          <span>Cancel</span>
        </motion.button>
      </div>
    </div>
  );
};

export default ItineraryDisplay;
