import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Get the backend URL from environment variable
  const BACKEND_URL = process.env.PYTHON_BACKEND_URL;

  if (!BACKEND_URL) {
    // Return mock data if backend is not configured
    return res.status(200).json({
      status: 'success',
      message: 'Using fallback data - Backend not configured',
      recommendations: [
        {
          id: 'mock-1',
          name: 'Popular Local Restaurant',
          category: 'food',
          area: 'Downtown',
          rating: 4.5,
          price: '250',
          image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400',
          popularity_score: 85
        },
        {
          id: 'mock-2',
          name: 'Budget Accommodation',
          category: 'accommodation',
          area: 'City Center',
          rating: 4.2,
          price: '2500',
          image: 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=400',
          bookmarked_by_users: 30
        },
        {
          id: 'mock-3',
          name: 'Quality Tiffin Service',
          category: 'tiffin',
          area: 'Nearby',
          rating: 4.7,
          price: '150',
          image: 'https://images.pexels.com/photos/958545/pexels-photo-958545.jpeg?auto=compress&cs=tinysrgb&w=400',
          association_confidence: 0.9
        }
      ]
    });
  }

  // Extract the path after /api/
  const path = req.url?.replace('/api', '') || '/';
  const backendUrl = `${BACKEND_URL}${path}`;

  try {
    const response = await fetch(backendUrl, {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: req.method !== 'GET' && req.method !== 'HEAD' ? JSON.stringify(req.body) : undefined,
    });

    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (error) {
    console.error('Backend proxy error:', error);
    
    // Return mock data on error
    return res.status(200).json({
      status: 'success',
      message: 'Using fallback data - Backend unavailable',
      recommendations: [
        {
          id: 'mock-1',
          name: 'Popular Local Restaurant',
          category: 'food',
          area: 'Downtown',
          rating: 4.5,
          price: '250',
          image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400',
          popularity_score: 85
        },
        {
          id: 'mock-2',
          name: 'Budget Accommodation',
          category: 'accommodation',
          area: 'City Center',
          rating: 4.2,
          price: '2500',
          image: 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=400',
          bookmarked_by_users: 30
        },
        {
          id: 'mock-3',
          name: 'Quality Tiffin Service',
          category: 'tiffin',
          area: 'Nearby',
          rating: 4.7,
          price: '150',
          image: 'https://images.pexels.com/photos/958545/pexels-photo-958545.jpeg?auto=compress&cs=tinysrgb&w=400',
          association_confidence: 0.9
        }
      ]
    });
  }
}
