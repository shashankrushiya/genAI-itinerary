// Demo itinerary data for the /demo route
export const demoItinerary = {
  destination: "Tokyo, Japan",
  duration: 5,
  budget: "Mid-range",
  interests: ["culture", "food", "temples", "shopping"],
  trip_id: "demo_trip_123",
  itinerary_id: "demo_itinerary_456",
  itinerary: [
    {
      day: 1,
      title: "Arrival & Asakusa Exploration",
      activities: [
        {
          name: "Arrive at Narita Airport",
          description: "Check into hotel and freshen up",
          estimated_cost: "¥0"
        },
        {
          name: "Senso-ji Temple",
          description: "Visit Tokyo's oldest temple and explore Nakamise shopping street",
          estimated_cost: "¥500"
        },
        {
          name: "Tokyo Skytree",
          description: "Evening visit to Tokyo's tallest structure for city views",
          estimated_cost: "¥2,100"
        },
        {
          name: "Dinner in Asakusa",
          description: "Traditional tempura dinner at a local restaurant",
          estimated_cost: "¥3,000"
        }
      ]
    },
    {
      day: 2,
      title: "Imperial Palace & Ginza",
      activities: [
        {
          name: "Imperial Palace East Gardens",
          description: "Morning walk through the beautiful palace gardens",
          estimated_cost: "¥0"
        },
        {
          name: "Ginza Shopping District",
          description: "Explore luxury shopping and department stores",
          estimated_cost: "¥5,000"
        },
        {
          name: "Tsukiji Outer Market",
          description: "Lunch at the famous fish market (now relocated)",
          estimated_cost: "¥2,500"
        },
        {
          name: "Kabuki-za Theatre",
          description: "Experience traditional Japanese theatre",
          estimated_cost: "¥4,000"
        }
      ]
    },
    {
      day: 3,
      title: "Shibuya & Harajuku",
      activities: [
        {
          name: "Meiji Shrine",
          description: "Peaceful shrine visit in the heart of the city",
          estimated_cost: "¥0"
        },
        {
          name: "Harajuku Takeshita Street",
          description: "Explore youth culture and unique fashion",
          estimated_cost: "¥3,000"
        },
        {
          name: "Shibuya Crossing",
          description: "Experience the world's busiest pedestrian crossing",
          estimated_cost: "¥0"
        },
        {
          name: "Shibuya Sky",
          description: "360-degree views from the rooftop observation deck",
          estimated_cost: "¥2,000"
        }
      ]
    },
    {
      day: 4,
      title: "Day Trip to Nikko",
      activities: [
        {
          name: "Toshogu Shrine",
          description: "UNESCO World Heritage site with elaborate decorations",
          estimated_cost: "¥1,300"
        },
        {
          name: "Kegon Falls",
          description: "Beautiful waterfall in Nikko National Park",
          estimated_cost: "¥550"
        },
        {
          name: "Lake Chuzenji",
          description: "Scenic mountain lake with boat rides available",
          estimated_cost: "¥1,000"
        },
        {
          name: "Return to Tokyo",
          description: "Evening return and casual dinner",
          estimated_cost: "¥2,000"
        }
      ]
    },
    {
      day: 5,
      title: "Departure Day",
      activities: [
        {
          name: "Last-minute Shopping",
          description: "Pick up souvenirs and gifts",
          estimated_cost: "¥5,000"
        },
        {
          name: "Traditional Kaiseki Lunch",
          description: "Multi-course traditional Japanese meal",
          estimated_cost: "¥8,000"
        },
        {
          name: "Departure",
          description: "Head to airport for departure",
          estimated_cost: "¥0"
        }
      ]
    }
  ]
};

export const featurePillars = [
  {
    icon: "Route",
    title: "Smart Routes",
    description: "AI-optimized itineraries that minimize travel time and maximize experiences"
  },
  {
    icon: "User",
    title: "Personalization",
    description: "Tailored recommendations based on your interests, budget, and travel style"
  },
  {
    icon: "Clock",
    title: "Live Constraints",
    description: "Real-time updates for weather, closures, and local events"
  },
  {
    icon: "Download",
    title: "Export Ready",
    description: "Generate PDFs, share with friends, or sync with your calendar"
  }
];
