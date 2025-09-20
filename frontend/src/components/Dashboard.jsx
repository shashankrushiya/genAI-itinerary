import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  MapPin, 
  Calendar, 
  DollarSign, 
  Heart, 
  Plus,
  Eye,
  Edit,
  Trash2,
  Clock,
  Globe
} from 'lucide-react';
import { fadeInUp, staggerContainer } from '../lib/motion';
import { getUserTrips } from '../lib/api';
import LoadingSpinner from './LoadingSpinner';

const Dashboard = ({ user, onNewTrip, onViewTrip, onEditTrip, onDeleteTrip, onOpenTripLibrary }) => {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      fetchUserTrips();
    }
  }, [user]);

  const fetchUserTrips = async () => {
    try {
      setLoading(true);
      const token = await user.getIdToken();
      const response = await getUserTrips(user.email, token);
      setTrips(response.trips || []);
    } catch (err) {
      console.error('Error fetching trips:', err);
      setError('Failed to load your trips. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size={48} text="Loading your trips..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-semibold text-white mb-4">
            Your Travel Dashboard
          </h1>
          <p className="text-xl text-white/70 mb-8">
            Manage and view all your AI-generated itineraries
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.button
              onClick={onNewTrip}
              className="bg-white text-black hover:bg-white/90 px-8 py-4 rounded-xl text-lg font-semibold flex items-center space-x-3 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Plus size={24} />
              <span>Create New Trip</span>
            </motion.button>
            
            <motion.button
              onClick={onOpenTripLibrary}
              className="bg-white/10 text-white hover:bg-white/20 px-8 py-4 rounded-xl text-lg font-semibold flex items-center space-x-3 transition-colors border border-white/20"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Globe size={24} />
              <span>Trip Library</span>
            </motion.button>
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
        {trips.length === 0 ? (
          <motion.div
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            className="text-center py-16"
          >
            <div className="bg-black rounded-2xl border border-white/10 p-12 max-w-md mx-auto">
              <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <MapPin size={48} className="text-white/60" />
              </div>
              <h3 className="text-2xl font-semibold text-white mb-4">
                No trips yet
              </h3>
              <p className="text-white/70 mb-8">
                Start your travel planning journey by creating your first AI-powered itinerary!
              </p>
              <motion.button
                onClick={onNewTrip}
                className="bg-white text-black hover:bg-white/90 px-6 py-3 rounded-lg font-semibold transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Create Your First Trip
              </motion.button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {trips.map((trip, index) => (
              <motion.div
                key={trip.trip_id}
                variants={fadeInUp}
                className="bg-black rounded-2xl border border-white/10 overflow-hidden hover:border-white/20 transition-all flex flex-col h-full"
              >
                {/* Trip Header */}
                <div className="bg-black p-6 text-white border-b border-white/10">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1 min-w-0 mr-3">
                      <h3 className="text-xl font-bold mb-1 truncate" title={trip.destination}>{trip.destination}</h3>
                      <p className="text-white/60 text-sm">
                        Created {formatDate(trip.created_at)}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <motion.button
                        onClick={() => onViewTrip(trip)}
                        className="bg-white/20 hover:bg-white/30 p-2 rounded-lg transition-colors"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        title="View Itinerary"
                      >
                        <Eye size={18} />
                      </motion.button>
                      <motion.button
                        onClick={() => onEditTrip(trip)}
                        className="bg-white/20 hover:bg-white/30 p-2 rounded-lg transition-colors"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        title="Edit Trip"
                      >
                        <Edit size={18} />
                      </motion.button>
                      <motion.button
                        onClick={() => onDeleteTrip(trip)}
                        className="bg-red-500/20 hover:bg-red-500/30 p-2 rounded-lg transition-colors"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        title="Delete Trip"
                      >
                        <Trash2 size={18} />
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
                    
                    <div className="flex items-center space-x-3">
                      <Clock size={20} className="text-white/60" />
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
                      onClick={() => onViewTrip(trip)}
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
      </div>
    </div>
  );
};

export default Dashboard;
