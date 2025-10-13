import React, { useState, useEffect } from 'react';
import { ServiceCard } from './ServiceCard';
import { supabase } from '../config/supabase';

interface Recommendation {
  id: string;
  name: string;
  category: string;
  area: string;
  rating: number;
  price: string;
  association_confidence?: number;
  association_lift?: number;
  bookmarked_by_users?: number;
  popularity_score?: number;
  based_on_services?: string[];
}

const convertRecommendationToService = (rec: Recommendation) => ({
  id: rec.id,
  name: rec.name,
  type: rec.category,
  city: rec.area,
  description: rec.association_confidence
    ? `Smart recommendation (${(rec.association_confidence * 100).toFixed(0)}% confidence)`
    : rec.bookmarked_by_users ? `Popular choice - ${rec.bookmarked_by_users} users`
      : `High-rated service`,
  price: parseFloat(rec.price) || 0,
  rating: rec.rating,
  image: '/api/placeholder/300/200',
  features: [`⭐ ${rec.rating}`, `📍 ${rec.area}`, rec.category]
});

export const Dashboard: React.FC = () => {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string>('');

  // Get current user ID from Supabase auth
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      } else {
        // Fallback to test user if no logged-in user
        setUserId('a1497ae5-5396-42a6-8e12-4a2113a52b0e');
      }
    };
    getCurrentUser();
  }, []);

  // Fetch recommendations for the logged-in user
  const fetchRecommendations = async () => {
    if (!userId) return;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`http://localhost:8000/recommendations/${userId}?n=6`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.status === 'success') {
        setRecommendations(data.recommendations || []);
      } else {
        throw new Error(data.message || 'Failed to fetch recommendations');
      }
    } catch (err) {
      console.error('Error fetching recommendations:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch recommendations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchRecommendations();
    }
  }, [userId]);

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="text-center px-4">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 mb-2 sm:mb-3">
          Recommended for You
        </h1>
        <p className="text-sm sm:text-base md:text-lg text-slate-600 max-w-2xl mx-auto px-2">
          Personalized recommendations based on your preferences and popular choices
        </p>
      </div>

      {/* Recommendations Grid */}
      <div className="px-4">
        {error ? (
          <div className="text-center py-8 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 font-medium">Error loading recommendations</p>
            <p className="text-red-500 text-sm mt-1">{error}</p>
            <button
              onClick={fetchRecommendations}
              className="mt-3 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        ) : loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg border border-slate-200 p-4 animate-pulse">
                <div className="h-32 bg-slate-200 rounded-lg mb-3"></div>
                <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-slate-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-slate-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : recommendations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendations.map((recommendation, index) => {
              const service = convertRecommendationToService(recommendation);
              return (
                <ServiceCard
                  key={`${recommendation.id}-${index}`}
                  service={service}
                  isBookmarked={false}
                  onToggleBookmark={() => { }}
                  onViewDetails={() => {
                    console.log('View details for:', recommendation.name);
                  }}
                  viewMode="grid"
                />
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 bg-slate-50 border border-slate-200 rounded-lg">
            <p className="text-slate-600 font-medium">No recommendations available</p>
            <p className="text-slate-500 text-sm mt-1">Check back later for personalized suggestions</p>
          </div>
        )}
      </div>
    </div>
  );
};