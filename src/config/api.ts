// API Configuration with mobile deployment support and Vercel compatibility
const getApiBaseUrl = () => {
  // Priority 1: Use explicit environment variable if set
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  
  // Priority 2: Production mode - use /api serverless function or deployed backend
  if (import.meta.env.MODE === 'production') {
    // For Vercel deployment, use /api path (serverless functions)
    // Or use the environment variable set in Vercel dashboard
    return '/api';
  }
  
  // Priority 3: Development mode - try localhost
  return 'http://localhost:8000';
};

const API_BASE_URL = getApiBaseUrl();

export const apiConfig = {
  baseUrl: API_BASE_URL,
  endpoints: {
    recommendations: (userId: string, limit: number = 6) => 
      `${API_BASE_URL}/recommendations/${userId}?n=${limit}`,
  },
};

// Helper function to check if we're in development mode
export const isDevelopment = import.meta.env.MODE === 'development';

// Helper function to detect mobile devices
const isMobile = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

// Helper function to make API requests with enhanced error handling and mobile support
export const apiRequest = async (url: string, options?: RequestInit) => {
  const isMobileDevice = isMobile();
  
  // Create AbortController for timeout handling
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), isMobileDevice ? 15000 : 10000);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...options?.headers,
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      // Handle specific error codes
      if (response.status === 404) {
        throw new Error('Recommendations service not found. Please check the backend deployment.');
      } else if (response.status === 500) {
        throw new Error('Server error. Please try again later.');
      } else if (response.status === 0 || !navigator.onLine) {
        throw new Error('Network connection issue. Please check your internet connection.');
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    
    console.error('API Request Error:', {
      url,
      isMobile: isMobileDevice,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });

    // Enhanced error handling for different scenarios
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error(
          'Request timed out. Please check your connection and try again.'
        );
      }
      
      if (error.message.includes('Failed to fetch') || error.name === 'TypeError') {
        if (isMobileDevice) {
          throw new Error(
            'Unable to connect to server. Please check your mobile network connection and try again.'
          );
        } else {
          throw new Error(
            `Unable to connect to backend server at ${API_BASE_URL}. ` +
            'Make sure the backend server is running.'
          );
        }
      }
    }
    
    throw error;
  }
};

// Fallback function for when API fails - returns mock data
export const getMockRecommendations = () => {
  return {
    status: 'success',
    recommendations: [
      {
        id: 'mock-1',
        name: 'Popular Local Restaurant',
        category: 'food',
        area: 'Downtown',
        rating: 4.5,
        price: '250',
        image: '/api/placeholder/300/200',
        popularity_score: 85
      },
      {
        id: 'mock-2',
        name: 'Budget Accommodation',
        category: 'accommodation',
        area: 'City Center',
        rating: 4.2,
        price: '2500',
        image: '/api/placeholder/300/200',
        bookmarked_by_users: 30
      },
      {
        id: 'mock-3',
        name: 'Quality Tiffin Service',
        category: 'tiffin',
        area: 'Nearby',
        rating: 4.7,
        price: '150',
        image: '/api/placeholder/300/200',
        association_confidence: 0.9
      }
    ]
  };
};
