// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export const apiConfig = {
  baseUrl: API_BASE_URL,
  endpoints: {
    recommendations: (userId: string, limit: number = 6) => 
      `${API_BASE_URL}/recommendations/${userId}?n=${limit}`,
  },
};

// Helper function to check if we're in development mode
export const isDevelopment = import.meta.env.MODE === 'development';

// Helper function to make API requests with error handling
export const apiRequest = async (url: string, options?: RequestInit) => {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    // In development, provide helpful error messages
    if (isDevelopment) {
      if (error instanceof Error && error.message.includes('Failed to fetch')) {
        throw new Error(
          `Unable to connect to backend server at ${API_BASE_URL}. ` +
          'Make sure the backend server is running on port 8000.'
        );
      }
    }
    throw error;
  }
};
