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
      
      <DemoItinerary onGetStartedClick={handleSignUpClick} />
      
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
