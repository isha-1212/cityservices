import React, { useState, useEffect } from 'react';
import { ServiceCard } from './ServiceCard';
import { ServiceDetails } from './ServiceDetails';
import { supabase } from '../config/supabase';
import { Service } from '../data/mockServices';
import { UserStorage } from '../utils/userStorage';
import { apiConfig, apiRequest } from '../config/api';

interface Recommendation {
  id: string;
  name: string;
  category: string;
  area: string;
  rating: number;
  price: string;
  image: string;
  association_confidence?: number;
  association_lift?: number;
  bookmarked_by_users?: number;
  popularity_score?: number;
  based_on_services?: string[];
}

const convertRecommendationToService = (rec: Recommendation): Service => ({
  id: rec.id,
  name: rec.name,
  type: rec.category as 'food' | 'accommodation' | 'tiffin' | 'transport' | 'coworking' | 'utilities',
  city: rec.area,
  description: rec.association_confidence
    ? `Smart recommendation (${(rec.association_confidence * 100).toFixed(0)}% confidence)`
    : rec.bookmarked_by_users ? `Popular choice - ${rec.bookmarked_by_users} users`
      : `High-rated service`,
  price: parseFloat(rec.price) || 0,
  rating: rec.rating,
  image: rec.image || '/api/placeholder/300/200',
  features: [`⭐ ${rec.rating}`, `📍 ${rec.area}`, rec.category]
});

export const Dashboard: React.FC = () => {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string>('');
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [userBookmarks, setUserBookmarks] = useState<Set<string>>(new Set());

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

      const data = await apiRequest(apiConfig.endpoints.recommendations(userId, 6));

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

  // Fetch user's bookmarks
  useEffect(() => {
    const loadBookmarks = async () => {
      if (!userId) return;

      try {
        const resolved = new Set<string>();

        // Load from database (ids) and items map
        const ids = await UserStorage.getWishlistFromDB();
        const itemsMap = await UserStorage.getWishlistItemsFromDB();

        console.log('Dashboard: Loaded bookmarks from DB ids:', ids);

        // Start with direct DB ids
        ids.forEach(id => resolved.add(id));

        // Try to reconcile any DB stored service_data or cached_bookmarks to current recommendations
        const cached = UserStorage.getItemAsJSON<Service[]>('cached_bookmarks', []);

        // Use itemsMap first to reconcile bookmarks
        Object.keys(itemsMap || {}).forEach(dbId => {
          const sd = itemsMap[dbId] || {};
          // Try to match with current recommendations
          const recommendationMatch = recommendations.find(rec => {
            const service = convertRecommendationToService(rec);
            return service.id === dbId ||
              (sd.name && sd.type &&
                service.type === sd.type &&
                service.name === sd.name &&
                service.city === sd.city);
          });
          if (recommendationMatch) {
            resolved.add(recommendationMatch.id);
          }
        });

        // Also reconcile cached_bookmarks
        cached.forEach(cb => {
          const recommendationMatch = recommendations.find(rec => {
            const service = convertRecommendationToService(rec);
            return service.type === cb.type &&
              service.name === cb.name &&
              service.city === cb.city;
          });
          if (recommendationMatch) {
            resolved.add(recommendationMatch.id);
          }
        });

        setUserBookmarks(prev => new Set([...Array.from(prev), ...Array.from(resolved)]));

        // Listen for bookmark changes
        const handleBookmarkChange = async () => {
          console.log('Dashboard: Received bookmarks change event, reloading bookmarks');
          loadBookmarks(); // Reload using the same reconciliation logic
        };

        window.addEventListener('wishlist:changed', handleBookmarkChange);
        return () => {
          window.removeEventListener('wishlist:changed', handleBookmarkChange);
        };
      } catch (error) {
        console.error('Error loading bookmarks:', error);
      }
    };

    if (recommendations.length > 0) {
      loadBookmarks();
    }
  }, [userId, recommendations]);

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Service Details Modal */}
      {selectedService && (
        <ServiceDetails
          service={selectedService}
          onClose={() => setSelectedService(null)}
        />
      )}

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
                  isBookmarked={userBookmarks.has(service.id)}
                  onToggleBookmark={async () => {
                    try {
                      if (userBookmarks.has(service.id)) {
                        // Remove bookmark using UserStorage
                        const success = await UserStorage.removeFromWishlistDB(service.id);
                        if (success) {
                          setUserBookmarks(prev => {
                            const next = new Set(prev);
                            next.delete(service.id);
                            return next;
                          });
                        }
                      } else {
                        // Add bookmark with complete service data using UserStorage
                        const serviceData = {
                          id: service.id,
                          name: service.name,
                          type: service.type,
                          city: service.city,
                          description: service.description,
                          price: service.price,
                          rating: service.rating,
                          image: service.image,
                          features: service.features
                        };

                        const success = await UserStorage.addToWishlistDB(service.id, serviceData);
                        if (success) {
                          setUserBookmarks(prev => new Set(prev).add(service.id));
                        }                        // Dispatch event to notify bookmarks/wishlist about the change
                        window.dispatchEvent(new CustomEvent('wishlist:changed'));
                      }
                    } catch (error) {
                      console.error('Error toggling bookmark:', error);
                    }
                  }}
                  onViewDetails={() => {
                    setSelectedService(service);
                  }}
                  viewMode="grid"
                  isBookmarkPage={false}
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