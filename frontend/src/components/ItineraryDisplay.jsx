import React, { useState } from 'react';
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
  Copy
} from 'lucide-react';
import { fadeInUp, staggerContainer } from '../lib/motion';

const ItineraryDisplay = ({ itinerary, tripDetails, onSave, onExport, onShare }) => {
  const [editableItinerary, setEditableItinerary] = useState(itinerary || []);
  const [editingDay, setEditingDay] = useState(null);
  const [editingActivity, setEditingActivity] = useState(null);
  const [newActivity, setNewActivity] = useState({ name: '', description: '', estimated_cost: '' });
  const [showAddActivity, setShowAddActivity] = useState({});

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

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header with Trip Details */}
      <motion.div
        variants={fadeInUp}
        initial="initial"
        animate="animate"
        className="bg-black rounded-2xl p-8 text-white mb-8 border border-white/10"
      >
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-3xl font-bold mb-2">Your Personalized Itinerary</h2>
            <p className="text-white/60 text-lg">
              {tripDetails?.destination} • {tripDetails?.duration} days • {tripDetails?.budget}
            </p>
          </div>
          <div className="flex space-x-3">
            <motion.button
              onClick={handleSaveItinerary}
              className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Save size={20} />
              <span>Save Changes</span>
            </motion.button>
            <motion.button
              onClick={handleExportPDF}
              className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Download size={20} />
              <span>Export PDF</span>
            </motion.button>
            <motion.button
              onClick={handleShareItinerary}
              className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Share2 size={20} />
              <span>Share</span>
            </motion.button>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center space-x-2">
            <MapPin size={20} />
            <span className="text-sm">{tripDetails?.destination}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Calendar size={20} />
            <span className="text-sm">{tripDetails?.duration} days</span>
          </div>
          <div className="flex items-center space-x-2">
            <DollarSign size={20} />
            <span className="text-sm">{tripDetails?.budget}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Clock size={20} />
            <span className="text-sm">{tripDetails?.interests?.join(', ')}</span>
          </div>
        </div>
      </motion.div>

      {/* Itinerary Days */}
      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="space-y-6"
      >
        {editableItinerary.map((day, dayIndex) => (
          <motion.div
            key={dayIndex}
            variants={fadeInUp}
            className="bg-black rounded-2xl border border-white/10 overflow-hidden"
          >
            {/* Day Header */}
            <div className="bg-black p-6 border-b border-white/10">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-4">
                  <div className="bg-white text-black w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg">
                    {day.day}
                  </div>
                  <div>
                    {editingDay === dayIndex ? (
                      <EditDayForm
                        day={day}
                        onSave={(updatedDay) => handleSaveDay(dayIndex, updatedDay)}
                        onCancel={() => setEditingDay(null)}
                      />
                    ) : (
                      <>
                        <h3 className="text-2xl font-semibold text-white">{day.title}</h3>
                        <p className="text-white/60">Day {day.day} of your adventure</p>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <motion.button
                    onClick={() => handleEditDay(dayIndex)}
                    className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Edit3 size={16} />
                    <span>{editingDay === dayIndex ? 'Cancel' : 'Edit Day'}</span>
                  </motion.button>
                  <motion.button
                    onClick={() => toggleAddActivity(dayIndex)}
                    className="bg-green-100 hover:bg-green-200 text-green-600 px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Plus size={16} />
                    <span>Add Activity</span>
                  </motion.button>
                </div>
              </div>
            </div>

            {/* Activities */}
            <div className="p-6">
              <div className="space-y-4">
                {day.activities.map((activity, activityIndex) => (
                  <div key={activityIndex} className="bg-white/5 rounded-lg p-4">
                    {editingActivity?.dayIndex === dayIndex && editingActivity?.activityIndex === activityIndex ? (
                      <EditActivityForm
                        activity={activity}
                        onSave={(updatedActivity) => handleSaveActivity(dayIndex, activityIndex, updatedActivity)}
                        onCancel={() => setEditingActivity(null)}
                      />
                    ) : (
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className="font-semibold text-white text-lg">{activity.name}</h4>
                            <motion.button
                              onClick={() => handleEditActivity(dayIndex, activityIndex)}
                              className="text-white/80 hover:text-white p-1"
                              whileHover={{ scale: 1.1 }}
                            >
                              <Edit3 size={16} />
                            </motion.button>
                            <motion.button
                              onClick={() => handleDeleteActivity(dayIndex, activityIndex)}
                              className="text-red-600 hover:text-red-700 p-1"
                              whileHover={{ scale: 1.1 }}
                            >
                              <Trash2 size={16} />
                            </motion.button>
                          </div>
                          <p className="text-white/70 mb-2">{activity.description}</p>
                          {activity.estimated_cost && (
                            <div className="flex items-center space-x-2">
                              <DollarSign size={16} className="text-green-600" />
                              <span className="text-green-600 font-medium">
                                {activity.estimated_cost.startsWith('$') 
                                  ? activity.estimated_cost 
                                  : `$${activity.estimated_cost}`}
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
                    <h5 className="font-semibold text-white mb-3">Add New Activity</h5>
                    <div className="space-y-3">
                      <input
                        type="text"
                        placeholder="Activity name"
                        value={newActivity.name}
                        onChange={(e) => setNewActivity({ ...newActivity, name: e.target.value })}
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:ring-2 focus:ring-white/50 focus:border-white/50"
                      />
                      <input
                        type="text"
                        placeholder="Description"
                        value={newActivity.description}
                        onChange={(e) => setNewActivity({ ...newActivity, description: e.target.value })}
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:ring-2 focus:ring-white/50 focus:border-white/50"
                      />
                      <input
                        type="text"
                        placeholder="Estimated cost (optional)"
                        value={newActivity.estimated_cost}
                        onChange={(e) => setNewActivity({ ...newActivity, estimated_cost: e.target.value })}
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:ring-2 focus:ring-white/50 focus:border-white/50"
                      />
                      <div className="flex space-x-2">
                        <motion.button
                          onClick={() => handleAddActivity(dayIndex)}
                          className="bg-white text-black hover:bg-white/90 px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Plus size={16} />
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
