import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  MapPin, 
  Calendar, 
  DollarSign, 
  Heart, 
  Globe,
  Search,
  User,
  Eye,
  ArrowRight
} from 'lucide-react';
import { fadeInUp, staggerContainer } from '../lib/motion';
import { getPublicTrips } from '../lib/api';
import LoadingSpinner from './LoadingSpinner';

const PublicTripLibrary = ({ onSignUpClick }) => {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    destination: '',
    budget: '',
    travel_style: ''
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [showAll, setShowAll] = useState(false);

  const fetchPublicTrips = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getPublicTrips(1, showAll ? 20 : 6, filters);
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

  if (loading) {
    return (
      <section className="py-20 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-16">
            <LoadingSpinner size={48} text="Loading amazing trips..." />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="trip-library" className="py-20 bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <motion.div variants={fadeInUp} className="flex items-center justify-center space-x-3 mb-6">
            <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/20">
              <Globe size={32} className="text-blue-300" />
            </div>
            <h2 className="text-4xl lg:text-5xl font-semibold text-white">
              Trip Library
            </h2>
          </motion.div>
          <motion.p variants={fadeInUp} className="text-lg text-white/70 max-w-3xl mx-auto mb-8">
            Discover amazing itineraries shared by our community. Get inspired by real trips 
            from fellow travelers around the world.
          </motion.p>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          variants={fadeInUp}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
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
            whileInView="animate"
            viewport={{ once: true }}
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
            whileInView="animate"
            viewport={{ once: true }}
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
                  onClick={onSignUpClick}
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
          <>
            <motion.div
              variants={staggerContainer}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
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
                        <div className="bg-white/20 p-2 rounded-lg">
                          <Eye size={18} className="text-white/60" />
                        </div>
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
                        onClick={onSignUpClick}
                        className="flex-1 bg-white text-black hover:bg-white/90 py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <span>Sign Up to View</span>
                        <ArrowRight size={16} />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Show More Button */}
            {!showAll && filteredTrips.length >= 6 && (
              <motion.div
                variants={fadeInUp}
                initial="initial"
                whileInView="animate"
                viewport={{ once: true }}
                className="text-center mt-12"
              >
                <motion.button
                  onClick={() => setShowAll(true)}
                  className="bg-white/10 text-white hover:bg-white/20 px-8 py-4 rounded-xl text-lg font-semibold flex items-center space-x-3 mx-auto transition-colors border border-white/20"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Globe size={24} />
                  <span>View All Public Trips</span>
                </motion.button>
              </motion.div>
            )}
          </>
        )}

        {/* CTA Section */}
        <motion.div
          variants={fadeInUp}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
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
              onClick={onSignUpClick}
              className="bg-white text-black hover:bg-white/90 px-8 py-4 rounded-xl text-lg font-semibold transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Get Started Free
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default PublicTripLibrary;
