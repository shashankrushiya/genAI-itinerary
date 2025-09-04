import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Calendar, DollarSign, Heart, ArrowRight, Play } from 'lucide-react';
import { fadeInUp, slideInLeft, slideInRight } from '../lib/motion';
import Subtle3DAnimation from './Subtle3DAnimation';

const Hero = ({ onTryDemo, onSignIn }) => {
  return (
    <section className="min-h-screen flex items-center justify-center bg-black pt-16 relative">
      <Subtle3DAnimation>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Text Content */}
          <motion.div
            variants={slideInLeft}
            initial="initial"
            animate="animate"
            className="space-y-8"
          >
            <motion.div variants={fadeInUp}>
              <h1 className="text-5xl lg:text-6xl font-semibold text-white leading-tight tracking-tight">
                Your Perfect
                <span className="block text-white/60">Travel Companion</span>
              </h1>
            </motion.div>
            
            <motion.p 
              className="text-xl text-white/70 leading-relaxed"
              variants={fadeInUp}
            >
              AI-powered itineraries that adapt to your style, budget, and interests. 
              Discover amazing destinations with personalized recommendations and smart route optimization.
            </motion.p>

            <motion.div 
              className="flex flex-col sm:flex-row gap-4"
              variants={fadeInUp}
            >
              <motion.button
                onClick={onTryDemo}
                className="flex items-center justify-center space-x-2 bg-white text-black px-8 py-4 rounded-full text-lg font-medium hover:bg-white/90 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Play size={20} />
                <span>Try Demo</span>
              </motion.button>
              
              <motion.button
                onClick={onSignIn}
                className="flex items-center justify-center space-x-2 border border-white/20 text-white px-8 py-4 rounded-full text-lg font-medium hover:border-white/40 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span>Get Started</span>
                <ArrowRight size={20} />
              </motion.button>
            </motion.div>

            {/* Feature Highlights */}
            <motion.div 
              className="grid grid-cols-2 gap-4 pt-8"
              variants={fadeInUp}
            >
              <div className="flex items-center space-x-3">
                <div className="bg-white/10 p-2 rounded-lg">
                  <MapPin className="text-white" size={20} />
                </div>
                <span className="text-white/70">Smart Routes</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="bg-white/10 p-2 rounded-lg">
                  <Calendar className="text-white" size={20} />
                </div>
                <span className="text-white/70">Flexible Planning</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="bg-white/10 p-2 rounded-lg">
                  <DollarSign className="text-white" size={20} />
                </div>
                <span className="text-white/70">Budget Friendly</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="bg-white/10 p-2 rounded-lg">
                  <Heart className="text-white" size={20} />
                </div>
                <span className="text-white/70">Personalized</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Column - Animated Map Preview */}
          <motion.div
            variants={slideInRight}
            initial="initial"
            animate="animate"
            className="relative"
          >
            <AnimatedMapPreview />
          </motion.div>
        </div>
      </div>
      </Subtle3DAnimation>
    </section>
  );
};

const AnimatedMapPreview = () => {
  return (
    <div className="relative w-full h-96 lg:h-[500px] bg-black rounded-2xl overflow-hidden shadow-2xl border border-white/10">
      {/* Background Map Pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-10 left-10 w-4 h-4 bg-white rounded-full animate-pulse"></div>
        <div className="absolute top-20 right-20 w-3 h-3 bg-white rounded-full animate-pulse delay-100"></div>
        <div className="absolute bottom-20 left-20 w-5 h-5 bg-white rounded-full animate-pulse delay-200"></div>
        <div className="absolute bottom-10 right-10 w-4 h-4 bg-white rounded-full animate-pulse delay-300"></div>
      </div>

      {/* Floating Day Cards */}
      <motion.div
        className="absolute top-8 left-8 bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-lg"
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="text-sm font-semibold text-gray-800">Day 1</div>
        <div className="text-xs text-gray-600">Tokyo Arrival</div>
      </motion.div>

      <motion.div
        className="absolute top-16 right-12 bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-lg"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      >
        <div className="text-sm font-semibold text-gray-800">Day 2</div>
        <div className="text-xs text-gray-600">Temples & Culture</div>
      </motion.div>

      <motion.div
        className="absolute bottom-20 left-16 bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-lg"
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      >
        <div className="text-sm font-semibold text-gray-800">Day 3</div>
        <div className="text-xs text-gray-600">Modern Tokyo</div>
      </motion.div>

      {/* Route Lines */}
      <svg className="absolute inset-0 w-full h-full">
        <motion.path
          d="M 80 120 Q 200 200 300 150 Q 400 100 500 200"
          stroke="white"
          strokeWidth="3"
          fill="none"
          strokeDasharray="10,5"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2, delay: 1 }}
        />
      </svg>

      {/* Center Content */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          className="text-center text-white"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
        >
          <div className="text-2xl font-bold mb-2">AI-Powered</div>
          <div className="text-lg opacity-90">Travel Planning</div>
        </motion.div>
      </div>
    </div>
  );
};

export default Hero;
