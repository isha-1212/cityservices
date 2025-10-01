import React, { useEffect, useState } from 'react';
import { MapPin, Trash2 } from 'lucide-react';
import mockServices, { Service } from '../data/mockServices';
import { ServiceDetails } from './ServiceDetails';
import { ServiceCard } from './ServiceCard';
import { UserStorage } from '../utils/userStorage';

interface BookmarksProps {
  user?: any;
  onAuthRequired?: () => void;
}

export const Bookmarks: React.FC<BookmarksProps> = ({ user, onAuthRequired }) => {
  const [bookmarkedServices, setBookmarkedServices] = useState<Service[]>([]);
  const [selected, setSelected] = useState<Service | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadBookmarks = async () => {
    try {
      if (!user) {
        setBookmarkedServices([]);
        setIsLoading(false);
        return;
      }

      // Try to load from cache first
      const cachedBookmarks = UserStorage.getItemAsJSON<Service[]>('cached_bookmarks', []);
      if (cachedBookmarks.length > 0) {
        setBookmarkedServices(cachedBookmarks);
      }

      // First try to migrate any local data to database
      await UserStorage.migrateWishlistToDatabase();

      // Load bookmarks from database
      const ids = await UserStorage.getWishlistFromDB();
      const map = await UserStorage.getWishlistItemsFromDB();

      const items = ids
        .map(id => (map[id] as Service) || mockServices.find(s => s.id === id))
        .filter((s): s is Service => Boolean(s));

      setBookmarkedServices(items);
      // Cache the latest bookmarks
      UserStorage.setItem('cached_bookmarks', items);
    } catch (e) {
      console.warn('Failed to load user bookmarks from database', e);
      setBookmarkedServices([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBookmarks();
  }, [user]);

  useEffect(() => {
    const handler = () => {
      loadBookmarks();
    };
    // Listen for both localStorage and database changes
    window.addEventListener('bookmarks:changed', handler);
    return () => {
      window.removeEventListener('bookmarks:changed', handler);
    };
  }, [loadBookmarks]);

  const removeLocal = async (id: string) => {
    if (!user) {
      onAuthRequired?.();
      return;
    }

    try {
      const success = await UserStorage.removeFromWishlistDB(id);
      if (success) {
        // Just update the local state immediately for better UX
        setBookmarkedServices(prev => prev.filter(service => service.id !== id));
      } else {
        throw new Error('Failed to remove from database');
      }
    } catch (error) {
      console.error('Failed to remove from bookmarks:', error);
    }
  }; return (
    <div className="space-y-4 sm:space-y-6">
      <div className="text-center mb-6 sm:mb-8 px-4">
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-2">Your Bookmarks</h2>
        <p className="text-sm sm:text-base text-slate-600">Saved services you added to your bookmarks</p>
      </div>

      {isLoading ? (
        <div className="text-center py-8 sm:py-12">
          <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-slate-700 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-sm sm:text-base text-gray-600">Loading your bookmarks...</p>
        </div>
      ) : !user ? (
        <div className="text-center py-8 sm:py-12 px-4">
          <div className="max-w-md mx-auto">
            <div className="mb-6">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Login to View Your Bookmarks</h3>
              <p className="text-sm sm:text-base text-gray-600 mb-6">
                Sign in to save your favorite services and access them from anywhere
              </p>
              <button
                onClick={() => onAuthRequired?.()}
                className="bg-slate-700 text-white px-6 py-3 text-sm sm:text-base rounded-lg hover:bg-slate-800 transition-colors w-full sm:w-auto"
              >
                Login / Sign Up
              </button>
            </div>
          </div>
        </div>
      ) : bookmarkedServices.length === 0 ? (
        <div className="text-center py-8 sm:py-12 px-4">
          <div className="max-w-md mx-auto">
            <div className="mb-6">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Your bookmarks list is empty</h3>
              <p className="text-sm sm:text-base text-gray-600">
                Start exploring services and add your favorites to see them here
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {bookmarkedServices.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              isBookmarked={true}
              onToggleBookmark={() => removeLocal(service.id)}
              onViewDetails={() => setSelected(service)}
              viewMode="grid"
              actionIcon={Trash2}
              actionLabel="Remove from bookmarks"
            />
          ))}
        </div>
      )}
      {selected && <ServiceDetails service={selected} onClose={() => setSelected(null)} />}
    </div>
  );
};