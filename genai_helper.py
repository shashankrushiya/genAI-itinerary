import google.generativeai as genai
import os
import re
from dotenv import load_dotenv
import json

load_dotenv()

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

def generate_itinerary(destination: str, days: int, budget: str, interests: list[str]):
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
              "estimated_cost": "$25 per person"
            }}
          ]
        }}
      ]
    }}

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