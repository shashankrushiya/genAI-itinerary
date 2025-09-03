import json
from fastapi import FastAPI, HTTPException, Depends
from firebase_config import db
from pydantic import BaseModel
from genai_helper import generate_itinerary
from datetime import datetime
from auth_middleware import get_current_user

# Pydantic model for a new user
class UserCreate(BaseModel):
    email: str
    name: str

class TripRequest(BaseModel):
    destination: str
    duration: int
    budget: str
    interests: list[str]

app = FastAPI()

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
            interests=trip_details.interests
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
            "interests": trip_details.interests,
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
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating or saving itinerary: {e}")