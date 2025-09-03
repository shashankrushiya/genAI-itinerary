import React, { useState, useEffect } from 'react';
import Auth from './components/Auth';
import TripPlanner from './components/TripPlanner';
import { auth } from './firebase'; // Your Firebase auth instance
import './App.css';

function App() {
    const [user, setUser] = useState(null);

    useEffect(() => {
        // Listen for authentication state changes
        const unsubscribe = auth.onAuthStateChanged(currentUser => {
            setUser(currentUser);
        });
        return () => unsubscribe(); // Cleanup the listener
    }, []);

    const handleSignOut = async () => {
        try {
            await auth.signOut();
            alert('Signed out successfully.');
        } catch (error) {
            console.error('Sign out error:', error);
        }
    };

    return (
        <div className="App">
            <header className="App-header">
                <h1>Gen-Itinerary</h1>
                {user ? (
                    <div>
                        <p>Welcome, {user.email}!</p>
                        <button onClick={handleSignOut}>Sign Out</button>
                    </div>
                ) : (
                    <Auth />
                )}
            </header>
            <main>
                {user && <TripPlanner />}
            </main>
        </div>
    );
}

export default App;