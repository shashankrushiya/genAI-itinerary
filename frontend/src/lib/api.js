// API wrapper for the two backend endpoints
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000';

// Enhanced error handling for production
class APIError extends Error {
  constructor(message, status, response) {
    super(message);
    this.name = 'APIError';
    this.status = status;
    this.response = response;
  }
}

async function handleResponse(response) {
  if (!response.ok) {
    let errorMessage = 'An error occurred';
    try {
      const errorData = await response.json();
      errorMessage = errorData.detail || errorData.message || errorMessage;
    } catch {
      errorMessage = await response.text() || errorMessage;
    }
    throw new APIError(errorMessage, response.status, response);
  }
  return response.json();
}

export async function createUser(user) {
  try {
    const res = await fetch(`${API_BASE_URL}/users/`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      credentials: 'include',
      body: JSON.stringify(user),
    });
    return await handleResponse(res);
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }
    throw new APIError('Network error: Unable to create user', 0, null);
  }
}

export async function generateItinerary(payload, token) {
  try {
    const res = await fetch(`${API_BASE_URL}/generate-itinerary/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        Authorization: `Bearer ${token}`,
      },
      credentials: 'include',
      body: JSON.stringify(payload),
    });
    return await handleResponse(res);
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }
    throw new APIError('Network error: Unable to generate itinerary', 0, null);
  }
}

// Function to get user data from backend
export async function getUserData(email) {
  try {
    const res = await fetch(`${API_BASE_URL}/users/${encodeURIComponent(email)}`, {
      method: "GET",
      headers: {
        "Accept": "application/json"
      },
      credentials: 'include',
    });
    return await handleResponse(res);
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }
    throw new APIError('Network error: Unable to fetch user data', 0, null);
  }
}

export async function getUserTrips(email, token) {
  try {
    const res = await fetch(`${API_BASE_URL}/users/${encodeURIComponent(email)}/trips`, {
      method: "GET",
      headers: {
        "Accept": "application/json",
        "Authorization": `Bearer ${token}`
      },
      credentials: 'include',
    });
    return await handleResponse(res);
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }
    throw new APIError('Network error: Unable to fetch user trips', 0, null);
  }
}

export async function getLiveConstraints(destination, duration) {
  try {
    const url = new URL(`${API_BASE_URL}/constraints`);
    url.searchParams.set('destination', destination);
    url.searchParams.set('duration', String(duration));
    const res = await fetch(url.toString(), {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      credentials: 'include'
    });
    return await handleResponse(res);
  } catch (error) {
    if (error instanceof APIError) throw error;
    throw new APIError('Network error: Unable to fetch live constraints', 0, null);
  }
}

// Pexels image search via backend proxy
export async function searchImages(query, perPage = 1) {
  try {
    const url = new URL(`${API_BASE_URL}/images/search`);
    url.searchParams.set('query', query);
    url.searchParams.set('per_page', String(perPage));
    const res = await fetch(url.toString(), {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      credentials: 'include'
    });
    return await handleResponse(res);
  } catch (error) {
    if (error instanceof APIError) throw error;
    throw new APIError('Network error: Unable to search images', 0, null);
  }
}

// Export error class for use in components
export { APIError };
