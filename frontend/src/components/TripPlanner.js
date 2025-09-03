// src/components/TripPlanner.js
import React, { useState } from 'react';
import axios from 'axios';
import { auth } from '../firebase'; // Assuming you have firebase.js configured

const TripPlanner = () => {
    const [destination, setDestination] = useState('');
    const [duration, setDuration] = useState('');
    const [budget, setBudget] = useState('');
    const [interests, setInterests] = useState('');
    const [itinerary, setItinerary] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setItinerary(null);

        try {
            const user = auth.currentUser;
            if (!user) {
                setError('You must be logged in to create a trip.');
                setLoading(false);
                return;
            }

            const token = await user.getIdToken();
            const response = await axios.post(
                'http://127.0.0.1:8000/generate-itinerary/', // Your FastAPI endpoint
                {
                    destination: destination,
                    duration: parseInt(duration),
                    budget: budget,
                    interests: interests.split(',').map(item => item.trim())
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            setItinerary(response.data.itinerary);
        } catch (err) {
            console.error(err);
            setError('Failed to generate itinerary. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '20px', maxWidth: '800px', margin: 'auto' }}>
            <h2>Create Your Trip</h2>
            <form onSubmit={handleSubmit}>
                <input type="text" placeholder="Destination" value={destination} onChange={(e) => setDestination(e.target.value)} required />
                <input type="number" placeholder="Duration (days)" value={duration} onChange={(e) => setDuration(e.target.value)} required />
                <input type="text" placeholder="Budget (e.g., Low, Mid-range, Luxury)" value={budget} onChange={(e) => setBudget(e.target.value)} required />
                <input type="text" placeholder="Interests (comma-separated)" value={interests} onChange={(e) => setInterests(e.target.value)} required />
                <button type="submit" disabled={loading}>
                    {loading ? 'Generating...' : 'Generate Itinerary'}
                </button>
            </form>

            {error && <p style={{ color: 'red' }}>{error}</p>}
            
            {itinerary && (
                <div style={{ marginTop: '20px', textAlign: 'left' }}>
                    <h3>Generated Itinerary:</h3>
                    {itinerary.map((day, index) => (
                        <div key={index} style={{ marginBottom: '15px', border: '1px solid #ccc', padding: '10px' }}>
                            <h4>Day {day.day}: {day.title}</h4>
                            <ul>
                                {day.activities.map((activity, actIndex) => (
                                    <li key={actIndex}>
                                        <strong>{activity.name}</strong>: {activity.description} 
                                        {activity.estimated_cost && ` (${activity.estimated_cost})`}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default TripPlanner;