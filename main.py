import json
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from firebase_config import db
from google.cloud import firestore
from pydantic import BaseModel
from genai_helper import generate_itinerary
from datetime import datetime, timedelta
from auth_middleware import get_current_user
import httpx
from typing import Optional, List, Dict, Any
import os
from dotenv import load_dotenv

# Load environment variables (.env) for local dev
load_dotenv()

# Pydantic model for a new user
class UserCreate(BaseModel):
    email: str
    name: str

class TripRequest(BaseModel):
    destination: str
    duration: int
    budget: str
    interests: Optional[list[str]] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    travel_style: Optional[str] = None
    is_public: Optional[bool] = False

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "https://gen-ai-itinerary.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create a new user
@app.post("/users/")
async def create_user(user_data: UserCreate):
    try:
        # Create a new document in the "users" collection with the user's email as the ID
        doc_ref = db.collection("users").document(user_data.email)
        doc_ref.set(user_data.model_dump())
        return {"message": "User created successfully", "user_email": user_data.email}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Get user data by email
@app.get("/users/{email}")
async def get_user(email: str):
    try:
        # Get the user document from Firestore
        doc_ref = db.collection("users").document(email)
        doc = doc_ref.get()
        
        if doc.exists:
            user_data = doc.to_dict()
            return {"email": user_data.get("email"), "name": user_data.get("name")}
        else:
            raise HTTPException(status_code=404, detail="User not found")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Get all trips for a user
@app.get("/users/{email}/trips")
async def get_user_trips(email: str, current_user: dict = Depends(get_current_user)):
    try:
        # Verify the user is requesting their own trips
        if current_user['email'] != email:
            raise HTTPException(status_code=403, detail="Access denied")
        
        # Query trips for this user
        trips_query = db.collection("trips").where("user_id", "==", current_user['uid'])
        trips = trips_query.stream()
        
        trips_list = []
        for trip in trips:
            trip_data = trip.to_dict()
            trip_data['trip_id'] = trip.id
            
            # Get the latest itinerary for this trip
            itineraries = trip.reference.collection("itineraries").limit(1).stream()
            for itinerary in itineraries:
                itinerary_data = itinerary.to_dict()
                trip_data['itinerary_id'] = itinerary.id
                trip_data['itinerary'] = itinerary_data.get("itinerary", [])
                break
            
            trips_list.append(trip_data)
        
        # Sort by creation date (newest first)
        trips_list.sort(key=lambda x: x.get('created_at', datetime.min), reverse=True)
        
        return {"trips": trips_list}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Generate an itinerary for a trip
@app.post("/generate-itinerary/")
async def create_and_save_itinerary(
    trip_details: TripRequest, 
    current_user: dict = Depends(get_current_user)):
    try:
        user_id = current_user['uid']

        # Step A: Generate the itinerary using Gemini AI
        itinerary_json_string = generate_itinerary(
            destination=trip_details.destination,
            days=trip_details.duration,
            budget=trip_details.budget,
            interests=trip_details.interests or [],
            travel_style=trip_details.travel_style
        )

        # Step B: Parse the JSON string into a Python dictionary
        itinerary_data = itinerary_json_string

        # Step C: Save the trip details and the generated itinerary to Firestore
        
        # 1. Create a new document in the "trips" collection
        trip_data = {
            "user_id": user_id,
            "destination": trip_details.destination,
            "duration": trip_details.duration,
            "budget": trip_details.budget,
            "interests": trip_details.interests or [],
            "start_date": trip_details.start_date,
            "end_date": trip_details.end_date,
            "travel_style": trip_details.travel_style,
            "is_public": trip_details.is_public or False,
            "created_at": datetime.now()
        }
        trip_doc_ref = db.collection("trips").document() # Firestore auto-generates the ID
        trip_doc_ref.set(trip_data)

        # 2. Add the generated itinerary to an "itineraries" subcollection
        #    We can save the entire JSON object directly.
        itinerary_doc_ref = trip_doc_ref.collection("itineraries").document()
        itinerary_doc_ref.set(itinerary_data)

        return {
            "message": "Itinerary generated and saved successfully",
            "trip_id": trip_doc_ref.id,
            "itinerary_id": itinerary_doc_ref.id,
            "itinerary": itinerary_data.get("itinerary", []),
            "trip_details": {
                "destination": trip_details.destination,
                "duration": trip_details.duration,
                "budget": trip_details.budget,
                "interests": trip_details.interests or [],
                "start_date": trip_details.start_date,
                "end_date": trip_details.end_date,
                "travel_style": trip_details.travel_style
            }
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating or saving itinerary: {e}")


# -------------- Live Constraints (Weather / Events / Alerts) --------------

WEATHER_CODE_MAP = {
    0: "Clear sky",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Fog",
    48: "Depositing rime fog",
    51: "Light drizzle",
    53: "Drizzle",
    55: "Dense drizzle",
    61: "Slight rain",
    63: "Rain",
    65: "Heavy rain",
    71: "Slight snow",
    73: "Snow",
    75: "Heavy snow",
    80: "Rain showers",
    81: "Rain showers",
    82: "Violent rain showers",
    95: "Thunderstorm",
}

async def _geocode_destination(destination: str) -> Optional[Dict[str, Any]]:
    """Geocode a destination name to lat/lon using Open‑Meteo's free API."""
    url = "https://geocoding-api.open-meteo.com/v1/search"
    
    # Try multiple variations to get better results
    search_terms = [
        destination,
        f"{destination}, Indonesia",  # Common for Bali, Jakarta, etc.
        f"{destination}, Thailand",    # Common for Bangkok, Phuket, etc.
        f"{destination}, Japan",      # Common for Tokyo, Kyoto, etc.
        f"{destination}, Italy",      # Common for Rome, Florence, etc.
        f"{destination}, France",    # Common for Paris, Nice, etc.
        f"{destination}, Spain",      # Common for Barcelona, Madrid, etc.
        f"{destination}, USA",        # Common for New York, Los Angeles, etc.
    ]
    
    async with httpx.AsyncClient(timeout=10) as client:
        for search_term in search_terms:
            params = {"name": search_term, "count": 5, "language": "en", "format": "json"}
            r = await client.get(url, params=params)
            if r.status_code != 200:
                continue
            data = r.json()
            results = data.get("results") or []
            
            # Look for the best match
            for result in results:
                name = result.get("name", "").lower()
                country = result.get("country", "").lower()
                
                # Skip if it's clearly the wrong location (like Bali, India)
                if destination.lower() == "bali" and "india" in country:
                    continue
                if destination.lower() == "bangkok" and "india" in country:
                    continue
                    
                # Prefer results that match the destination name closely
                if destination.lower() in name or name in destination.lower():
                    return result
            
            # If no good match found, return the first result
            if results:
                return results[0]
    
    return None

async def _fetch_weather(lat: float, lon: float, days: int, start_date: Optional[str] = None) -> List[Dict[str, Any]]:
    """Fetch a simple multi‑day forecast from Open‑Meteo."""
    url = "https://api.open-meteo.com/v1/forecast"
    params = {
        "latitude": lat,
        "longitude": lon,
        "daily": "weathercode,temperature_2m_max,temperature_2m_min,precipitation_probability_mean",
        "forecast_days": max(1, min(days, 16)),
        "timezone": "auto",
    }
    
    # Note: Open-Meteo doesn't support start_date/end_date with forecast_days
    # We'll get current forecast and adjust dates in post-processing if needed
    async with httpx.AsyncClient(timeout=10) as client:
        r = await client.get(url, params=params)
        r.raise_for_status()
        d = r.json().get("daily", {})
        dates = d.get("time", [])
        codes = d.get("weathercode", [])
        tmax = d.get("temperature_2m_max", [])
        tmin = d.get("temperature_2m_min", [])
        precip = d.get("precipitation_probability_mean", [])
        out = []
        for i in range(min(len(dates), days)):
            code = codes[i] if i < len(codes) else None
            out.append({
                "date": dates[i],
                "summary": WEATHER_CODE_MAP.get(code, "Weather"),
                "code": code,
                "high_c": tmax[i] if i < len(tmax) else None,
                "low_c": tmin[i] if i < len(tmin) else None,
                "precip_prob": precip[i] if i < len(precip) else None,
            })
        return out

def _mock_events(destination: str, days: int) -> List[List[Dict[str, Any]]]:
    """Simple placeholder events per day. Replace with real provider later."""
    samples = [
        {"name": "Street food market", "time": "18:00", "location": destination},
        {"name": "Cultural performance", "time": "20:00", "location": destination},
        {"name": "Local walking tour", "time": "10:00", "location": destination},
    ]
    return [[samples[i % len(samples)]] for i in range(days)]

@app.get("/constraints")
async def get_live_constraints(destination: str, duration: int = 5, start_date: Optional[str] = None):
    """
    Returns live constraints to augment an itinerary:
    - Daily weather (Open‑Meteo)
    - Placeholder events and basic advisories (mock)

    This endpoint avoids requiring API keys and can be swapped for
    production providers later (e.g., weather, events, places/closures).
    """
    try:
        geo = await _geocode_destination(destination)
        days = max(1, min(duration, 16))

        weather = []
        if geo:
            weather = await _fetch_weather(geo["latitude"], geo["longitude"], days, start_date)

        # Mock events and basic advisories for now
        events = _mock_events(destination, days)
        alerts = [
            [] for _ in range(days)
        ]

        return {
            "destination": destination,
            "generated_at": datetime.utcnow().isoformat() + "Z",
            "days": [
                {
                    "day": i + 1,
                    "weather": weather[i] if i < len(weather) else None,
                    "events": events[i],
                    "alerts": alerts[i],
                }
                for i in range(days)
            ],
            "sources": {
                "weather": "open-meteo",
                "events": "mock",
                "alerts": "mock"
            }
        }
    except httpx.HTTPError as e:
        # Graceful degradation
        return {
            "destination": destination,
            "generated_at": datetime.utcnow().isoformat() + "Z",
            "days": [
                {"day": i + 1, "weather": None, "events": [], "alerts": []}
                for i in range(max(1, min(duration, 7)))
            ],
            "error": str(e)
        }


# ---------------- Pexels Image Proxy ----------------

PEXELS_API_KEY = os.getenv("PEXELS_API_KEY")
PEXELS_CACHE: Dict[str, Dict[str, Any]] = {}
try:
    PEXELS_CACHE_TTL = int(os.getenv("PEXELS_CACHE_TTL_SECONDS", "86400"))  # 24h default
except ValueError:
    PEXELS_CACHE_TTL = 86400

# ---------------- Geocoding and Places API ----------------

@app.get("/geocode/{destination}")
async def geocode_destination_endpoint(destination: str):
    """
    Get latitude/longitude coordinates for a destination.
    Used by frontend for map centering and location services.
    """
    try:
        geo = await _geocode_destination(destination)
        if geo:
            return {
                "destination": destination,
                "latitude": geo["latitude"],
                "longitude": geo["longitude"],
                "country": geo.get("country", ""),
                "admin1": geo.get("admin1", ""),
                "formatted_name": geo.get("name", destination)
            }
        else:
            raise HTTPException(status_code=404, detail="Destination not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Geocoding failed: {str(e)}")

@app.get("/places/{destination}")
async def get_places_near_destination(
    destination: str, 
    place_type: str = "tourist_attraction",
    limit: int = 10
):
    """
    Get nearby places of interest for a destination.
    Used for activity suggestions and location data.
    """
    try:
        # First geocode the destination
        geo = await _geocode_destination(destination)
        if not geo:
            raise HTTPException(status_code=404, detail="Destination not found")
        
        # For now, return mock data. In production, integrate with Google Places API
        mock_places = [
            {
                "name": f"Popular {place_type.replace('_', ' ')} in {destination}",
                "location": f"{geo['latitude']},{geo['longitude']}",
                "rating": 4.5,
                "type": place_type,
                "description": f"A must-visit {place_type.replace('_', ' ')} in {destination}"
            }
        ]
        
        return {
            "destination": destination,
            "places": mock_places,
            "center": {
                "latitude": geo["latitude"],
                "longitude": geo["longitude"]
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Places lookup failed: {str(e)}")

@app.get("/images/search")
async def search_images(query: str, per_page: int = 1):
    """
    Lightweight proxy to Pexels Search API to avoid exposing the API key
    to the frontend and to handle CORS. Returns a small subset of fields.

    Query params:
      - query: search text (e.g., "Tokyo sushi")
      - per_page: number of images to return (default 1)
    """
    if not PEXELS_API_KEY:
        # Graceful degradation without failing the UI
        return {"photos": [], "error": "not_configured"}

    headers = {"Authorization": PEXELS_API_KEY}
    params = {
        "query": query,
        "per_page": max(1, min(per_page, 5)),
        "orientation": "landscape",
    }
    cache_key = f"{query}|{params['per_page']}|{params['orientation']}"
    now_ts = int(datetime.utcnow().timestamp())
    cached = PEXELS_CACHE.get(cache_key)
    if cached and now_ts - cached.get("ts", 0) < PEXELS_CACHE_TTL:
        return cached["data"]
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            r = await client.get("https://api.pexels.com/v1/search", headers=headers, params=params)
            if r.status_code == 429:
                # Rate limited: return empty result so frontend can fallback
                data_out = {"photos": [], "error": "rate_limited"}
                return data_out
            r.raise_for_status()
            data = r.json()
            photos = data.get("photos", [])
            out = []
            for p in photos:
                src = p.get("src", {})
                out.append({
                    "url": src.get("landscape") or src.get("large") or src.get("medium") or src.get("original"),
                    "alt": p.get("alt") or "",
                    "photographer": p.get("photographer"),
                    "photographer_url": p.get("photographer_url"),
                    "source": "pexels",
                })
            data_out = {"photos": out}
            # Cache successful responses
            PEXELS_CACHE[cache_key] = {"ts": now_ts, "data": data_out}
            return data_out
    except httpx.HTTPError as e:
        # Degrade gracefully; let frontend fallback
        return {"photos": [], "error": f"downstream_error: {str(e)}"}

@app.get("/api/trip-library")
async def get_public_trips(
    page: int = 1,
    limit: int = 12,
    destination: Optional[str] = None,
    budget: Optional[str] = None,
    travel_style: Optional[str] = None
):
    """Get public trips for the Trip Library with optional filtering"""
    try:
        # Build query for public trips (simplified to avoid index requirements)
        query = db.collection("trips").where("is_public", "==", True)
        
        # Apply pagination first
        offset = (page - 1) * limit
        query = query.offset(offset).limit(limit)
        
        # Execute query
        trips_docs = query.stream()
        
        trips = []
        for trip_doc in trips_docs:
            trip_data = trip_doc.to_dict()
            trip_data["trip_id"] = trip_doc.id
            
            # Apply client-side filtering
            if destination and destination.lower() not in trip_data.get("destination", "").lower():
                continue
            if budget and trip_data.get("budget") != budget:
                continue
            if travel_style and trip_data.get("travel_style") != travel_style:
                continue
            
            # Get user info for the trip creator
            try:
                user_doc = db.collection("users").document(trip_data["user_id"]).get()
                if user_doc.exists:
                    user_data = user_doc.to_dict()
                    trip_data["creator_name"] = user_data.get("name", "Anonymous")
                    trip_data["creator_email"] = user_data.get("email", "")
                else:
                    trip_data["creator_name"] = "Anonymous"
                    trip_data["creator_email"] = ""
            except Exception:
                trip_data["creator_name"] = "Anonymous"
                trip_data["creator_email"] = ""
            
            # Get itinerary preview (first few days)
            try:
                itinerary_docs = trip_doc.reference.collection("itineraries").limit(1).stream()
                for itinerary_doc in itinerary_docs:
                    itinerary_data = itinerary_doc.to_dict()
                    trip_data["itinerary"] = itinerary_data.get("itinerary", [])
                    break
            except Exception:
                trip_data["itinerary"] = []
            
            trips.append(trip_data)
        
        return {
            "trips": trips,
            "page": page,
            "limit": limit,
            "total": len(trips)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch public trips: {str(e)}")

@app.get("/api/trip-library/{trip_id}")
async def get_public_trip_details(trip_id: str):
    """Get detailed information about a specific public trip"""
    try:
        # Get trip document
        trip_doc = db.collection("trips").document(trip_id).get()
        if not trip_doc.exists:
            raise HTTPException(status_code=404, detail="Trip not found")
        
        trip_data = trip_doc.to_dict()
        
        # Check if trip is public
        if not trip_data.get("is_public", False):
            raise HTTPException(status_code=403, detail="This trip is not public")
        
        trip_data["trip_id"] = trip_id
        
        # Get user info for the trip creator
        try:
            user_doc = db.collection("users").document(trip_data["user_id"]).get()
            if user_doc.exists:
                user_data = user_doc.to_dict()
                trip_data["creator_name"] = user_data.get("name", "Anonymous")
                trip_data["creator_email"] = user_data.get("email", "")
            else:
                trip_data["creator_name"] = "Anonymous"
                trip_data["creator_email"] = ""
        except Exception:
            trip_data["creator_name"] = "Anonymous"
            trip_data["creator_email"] = ""
        
        # Get full itinerary
        try:
            itinerary_docs = trip_doc.reference.collection("itineraries").limit(1).stream()
            for itinerary_doc in itinerary_docs:
                itinerary_data = itinerary_doc.to_dict()
                trip_data["itinerary"] = itinerary_data.get("itinerary", [])
                break
        except Exception:
            trip_data["itinerary"] = []
        
        return trip_data
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch trip details: {str(e)}")

@app.put("/api/trips/{trip_id}/itinerary")
async def update_trip_itinerary(
    trip_id: str,
    itinerary_data: dict,
    current_user: dict = Depends(get_current_user)
):
    """Update the itinerary for a specific trip"""
    try:
        user_id = current_user['uid']
        
        # Get the trip document
        trip_doc = db.collection("trips").document(trip_id).get()
        if not trip_doc.exists:
            raise HTTPException(status_code=404, detail="Trip not found")
        
        trip_data = trip_doc.to_dict()
        
        # Check if the user owns this trip
        if trip_data.get("user_id") != user_id:
            raise HTTPException(status_code=403, detail="You can only update your own trips")
        
        # Update the itinerary in the subcollection
        itinerary_docs = trip_doc.reference.collection("itineraries").limit(1).stream()
        itinerary_doc_ref = None
        
        for doc in itinerary_docs:
            itinerary_doc_ref = doc.reference
            break
        
        if not itinerary_doc_ref:
            raise HTTPException(status_code=404, detail="Itinerary not found")
        
        # Update the itinerary data
        itinerary_doc_ref.update({
            "itinerary": itinerary_data.get("itinerary", []),
            "updated_at": datetime.now()
        })
        
        return {
            "message": "Itinerary updated successfully",
            "trip_id": trip_id,
            "updated_at": datetime.now().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update itinerary: {str(e)}")
