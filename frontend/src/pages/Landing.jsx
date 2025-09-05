import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import FeaturePillars from '../components/FeaturePillars';
import DemoItinerary from '../components/DemoItinerary';
import Footer from '../components/Footer';
import AuthSidePanel from '../components/AuthSidePanel';
import { auth } from '../firebase';
import { getUserData } from '../lib/api';
import { motion } from 'framer-motion';
import { fadeInUp, staggerContainer } from '../lib/motion';

const Landing = () => {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [authPanelOpen, setAuthPanelOpen] = useState(false);
  const [authMode, setAuthMode] = useState('signin');
  const navigate = useNavigate();

  // Listen for auth state changes and fetch user data
  React.useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      setUser(currentUser);
      
      // If user is authenticated, fetch their data from backend
      if (currentUser) {
        try {
          const data = await getUserData(currentUser.email);
          setUserData(data);
        } catch (error) {
          console.error('Error fetching user data:', error);
          // If user data not found, create a fallback
          setUserData({ email: currentUser.email, name: currentUser.displayName || 'User' });
        }
      } else {
        setUserData(null);
      }
    });
    return () => unsubscribe();
  }, []);

  // Listen for custom event to open sign-up from demo page
  React.useEffect(() => {
    const handleOpenSignUp = () => {
      setAuthMode('signup');
      setAuthPanelOpen(true);
    };

    window.addEventListener('openSignUp', handleOpenSignUp);
    return () => window.removeEventListener('openSignUp', handleOpenSignUp);
  }, []);

  const handleSignInClick = () => {
    if (user) {
      // If user is already logged in, redirect to app
      navigate('/app');
    } else {
      setAuthMode('signin');
      setAuthPanelOpen(true);
    }
  };

  const handleSignUpClick = () => {
    if (user) {
      // If user is already logged in, redirect to app
      navigate('/app');
    } else {
      setAuthMode('signup');
      setAuthPanelOpen(true);
    }
  };

  const handleAuthSuccess = async (user) => {
    setUser(user);
    // Fetch user data after successful authentication
    try {
      const data = await getUserData(user.email);
      setUserData(data);
    } catch (error) {
      console.error('Error fetching user data:', error);
      setUserData({ email: user.email, name: user.displayName || 'User' });
    }
    navigate('/app');
  };

  const handleSignOut = async () => {
    try {
      await auth.signOut();
      setUser(null);
      setUserData(null);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const handleTryDemo = () => {
    navigate('/demo');
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar
        onSignInClick={handleSignInClick}
        onSignUpClick={handleSignUpClick}
        user={userData}
        onSignOut={handleSignOut}
      />
      
      <Hero
        onTryDemo={handleTryDemo}
        onSignIn={handleSignInClick}
      />
      
      <FeaturePillars />
      
      <DemoItinerary onGetStartedClick={handleSignUpClick} showCTA={false} />

      {/* About Section */}
      <section id="about" className="py-20 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="text-center"
          >
            <motion.h2 variants={fadeInUp} className="text-4xl lg:text-5xl font-semibold text-white mb-6">
              About This Project
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-lg text-white/70 max-w-3xl mx-auto">
              GenItinerary is an AI-powered trip planner built by Shashank as a hackathon project.
              It leverages Gemini AI to generate personalized, day-by-day itineraries using your
              destination, duration, budget, and interests.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* CTA below About */}
      <section className="py-10 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={fadeInUp}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="text-center"
          >
            <div className="bg-black rounded-2xl p-8 text-white border border-white/10">
              <h3 className="text-3xl font-bold mb-4">Ready to Plan Your Own Adventure?</h3>
              <p className="text-xl text-white/70 mb-8">
                Sign up now and let our AI create a personalized itinerary just for you.
              </p>
              <motion.button
                onClick={handleSignUpClick}
                className="bg-white text-black px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white/90 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Get Started Free
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />

      <AuthSidePanel
        isOpen={authPanelOpen}
        onClose={() => setAuthPanelOpen(false)}
        mode={authMode}
        onModeChange={setAuthMode}
        onAuthSuccess={handleAuthSuccess}
      />
    </div>
  );
};

export default Landing;
