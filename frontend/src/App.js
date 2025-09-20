import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Demo from './pages/Demo';
import App from './pages/App';
import TripLibraryPage from './pages/TripLibraryPage';
import ErrorBoundary from './components/ErrorBoundary';
import './App.css';

function AppRouter() {
  return (
    <ErrorBoundary>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/demo" element={<Demo />} />
            <Route path="/app" element={<App />} />
            <Route path="/trip-library" element={<TripLibraryPage />} />
          </Routes>
        </div>
      </Router>
    </ErrorBoundary>
  );
}

export default AppRouter;