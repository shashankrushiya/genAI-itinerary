import google.generativeai as genai
import os
import re
from dotenv import load_dotenv
import json

load_dotenv()

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

def generate_itinerary(destination: str, days: int, budget: str, interests: list[str], travel_style: str = None):
    """
    Generates a trip itinerary using the Gemini AI with a structured JSON output.
    """
    prompt = f"""
    Act as an expert travel agent. Generate a detailed, 
    day-by-day travel itinerary in a structured JSON format. 

    The itinerary should be tailored to the following criteria:
    - Destination: {destination}
    - Duration: {days} days
    - Budget: {budget} $
    - Interests: {', '.join(interests)}
    - Travel Style: {travel_style if travel_style else 'General travel'}

    The JSON output must be a single array of objects. Each object represents a day.

    {{
      "itinerary": [
        {{
          "day": 1,
          "title": "A Day of History and Culture",
          "activities": [
            {{
              "name": "Activity Name",
              "description": "Description of the activity.",
              "estimated_cost": "$25 per person",
              "location": "Specific address or landmark name in {destination}",
              "duration": "2-3 hours",
              "tags": ["outdoor", "cultural", "historical"]
            }}
          ]
        }}
      ]
    }}

    Important: For each activity, include:
    - "location": A specific address, landmark, or area name in {destination}
    - "duration": Estimated time for the activity
    - "tags": Array of relevant tags like ["outdoor", "indoor", "cultural", "food", "shopping", "nature", "historical"]

    Travel Style Guidelines:
    - Relaxation: Focus on spa treatments, beach time, leisurely meals, peaceful activities
    - Cultural and Historical: Emphasize museums, historical sites, cultural experiences, local traditions
    - Romantic for Couples: Include romantic restaurants, scenic spots, intimate experiences, sunset views
    - Family-Friendly: Choose activities suitable for all ages, educational experiences, fun attractions
    - Adventure and Outdoor: Prioritize hiking, outdoor sports, adrenaline activities, nature exploration
    - Food and Culinary: Focus on local cuisine, cooking classes, food tours, market visits
    - Nightlife and Entertainment: Include bars, clubs, shows, evening activities, entertainment venues
    - Shopping and Markets: Emphasize local markets, shopping districts, unique stores, souvenirs
    - Nature and Wildlife: Focus on parks, wildlife viewing, nature reserves, outdoor activities
    - Art and Museums: Prioritize art galleries, museums, cultural centers, artistic experiences
    - Business and Professional: Include networking opportunities, business districts, professional venues

    Generate the itinerary now. Do not include any text outside the JSON.
    Please generate the itinerary now. **DO NOT INCLUDE ANY TEXT OUTSIDE THE JSON. ONLY RETURN THE JSON OBJECT.
    """

    model = genai.GenerativeModel('gemini-1.5-flash')
    response = model.generate_content(prompt)
    
    # Use a regular expression to find the first JSON object and extract it
    # This pattern looks for content between the first `{` and the last `}`
    match = re.search(r'\{.*\}', response.text, re.DOTALL)
    
    if match:
        raw_json_string = match.group(0)
    else:
        raise ValueError("No valid JSON object found in AI response.")

    try:
        # Validate and return the parsed JSON
        return json.loads(raw_json_string)
    except json.JSONDecodeError as e:
        # If there's still a JSON error, it's likely malformed JSON
        raise ValueError(f"AI returned malformed JSON: {e}")