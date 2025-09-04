import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Menu, X, User, LogIn } from 'lucide-react';

const Navbar = ({ onSignInClick, onSignUpClick, user, onSignOut }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <motion.nav 
      className="fixed top-0 left-0 right-0 z-50 bg-black/60 backdrop-blur-xl border-b border-white/10"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <motion.div 
            className="flex items-center"
            whileHover={{ scale: 1.05 }}
          >
            <span className="text-2xl font-semibold tracking-tight text-white">GenItinerary</span>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-white/70 hover:text-white transition-colors">
              Features
            </a>
            <a href="#demo" className="text-white/70 hover:text-white transition-colors">
              Demo
            </a>
            
            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-white/80">Welcome, {user.name || user.email}</span>
                <motion.button
                  onClick={onSignOut}
                  className="px-4 py-2 rounded-lg bg-white text-black hover:bg-white/80 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Sign Out
                </motion.button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <motion.button
                  onClick={onSignUpClick}
                  className="flex items-center space-x-2 text-white/70 hover:text-white transition-colors"
                  whileHover={{ scale: 1.05 }}
                >
                  <User size={20} />
                  <span>Sign Up</span>
                </motion.button>
                <motion.button
                  onClick={onSignInClick}
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-white text-black hover:bg-white/80 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <LogIn size={20} />
                  <span>Sign In</span>
                </motion.button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <motion.button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-600 hover:text-primary-600"
              whileTap={{ scale: 0.95 }}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </motion.button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <motion.div 
            className="md:hidden py-4 border-t border-gray-200"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="flex flex-col space-y-4">
              <a href="#features" className="text-gray-600 hover:text-primary-600 transition-colors">
                Features
              </a>
              <a href="#demo" className="text-gray-600 hover:text-primary-600 transition-colors">
                Demo
              </a>
              
              {user ? (
                <div className="flex flex-col space-y-2">
                  <span className="text-gray-300">Welcome, {user.name || user.email}</span>
                  <button
                    onClick={onSignOut}
                    className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors text-left"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="flex flex-col space-y-2">
                  <button
                    onClick={onSignUpClick}
                    className="flex items-center space-x-2 text-gray-600 hover:text-primary-600 transition-colors text-left"
                  >
                    <User size={20} />
                    <span>Sign Up</span>
                  </button>
                  <button
                    onClick={onSignInClick}
                    className="flex items-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors text-left"
                  >
                    <LogIn size={20} />
                    <span>Sign In</span>
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </motion.nav>
  );
};

export default Navbar;
