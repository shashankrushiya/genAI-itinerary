import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Lock } from 'lucide-react';
import DemoItinerary from '../components/DemoItinerary';
import { fadeInUp } from '../lib/motion';

const Demo = () => {
  const navigate = useNavigate();

  const handleGetStartedClick = () => {
    navigate('/');
    // Small delay to ensure navigation completes before opening signup
    setTimeout(() => {
      // This will be handled by the landing page
      window.dispatchEvent(new CustomEvent('openSignUp'));
    }, 100);
  };

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
            <motion.button
              onClick={() => navigate('/')}
              className="flex items-center space-x-2 text-white/80 hover:text-white transition-colors"
              whileHover={{ scale: 1.05 }}
            >
              <ArrowLeft size={20} />
              <span>Back to Home</span>
            </motion.button>
            
            <div className="flex items-center space-x-2 bg-white/10 text-white px-4 py-2 rounded-lg">
              <Lock size={16} />
              <span className="text-sm font-medium">Demo Mode</span>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Demo Content */}
      <DemoItinerary onGetStartedClick={handleGetStartedClick} />
    </div>
  );
};

export default Demo;
