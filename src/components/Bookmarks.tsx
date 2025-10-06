import React, { useEffect, useState } from 'react';
import { MapPin, Trash2, Calculator } from 'lucide-react';
import mockServices, { Service } from '../data/mockServices';
import { ServiceDetails } from './ServiceDetails';
import { ServiceCard } from './ServiceCard';
import { UserStorage } from '../utils/userStorage';
import { BudgetBuddy } from './BudgetBuddy';
import { loadAllServices as loadAllServicesFromCSV } from '../utils/serviceLoader';

interface BookmarksProps {
  user?: any;
  onAuthRequired?: () => void;
}

export const Bookmarks: React.FC<BookmarksProps> = ({ user, onAuthRequired }) => {
  const [bookmarkedServices, setBookmarkedServices] = useState<Service[]>([]);
  const [selected, setSelected] = useState<Service | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showBudgetBuddy, setShowBudgetBuddy] = useState(false);
  const [allServices, setAllServices] = useState<Service[]>([]);

  const loadBookmarks = async () => {
    try {
      if (!user) {
        setBookmarkedServices([]);
        setIsLoading(false);
        return;
      }

      // Clear previous bookmarks to avoid duplicates
      setBookmarkedServices([]);

      // Try to load from cache first
      const cachedBookmarks = UserStorage.getItemAsJSON<Service[]>('cached_bookmarks', []);
      if (cachedBookmarks.length > 0) {
        // Filter out invalid or empty services
        const validCached = cachedBookmarks.filter(s => s && s.id && s.name);
        setBookmarkedServices(validCached);
      }

      // First try to migrate any local data to database
      await UserStorage.migrateWishlistToDatabase();

      // Load bookmarks from database
      const ids = await UserStorage.getWishlistFromDB();
      const map = await UserStorage.getWishlistItemsFromDB();

      const items = ids
        .map(id => (map[id] as Service) || mockServices.find(s => s.id === id))
        .filter((s): s is Service => Boolean(s))
        .filter(s => s.id && s.name); // Filter invalid services

      setBookmarkedServices(items);
      // Cache the latest bookmarks
      UserStorage.setItem('cached_bookmarks', items);

      // Dispatch event to notify other components of bookmark changes
      console.log('Bookmarks: Dispatching bookmarks:changed event after loading bookmarks');
      window.dispatchEvent(new CustomEvent('bookmarks:changed'));
    } catch (e) {
      console.warn('Failed to load user bookmarks from database', e);
      setBookmarkedServices([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBookmarks();
    loadAllServices();
  }, [user]);

  const loadAllServices = async () => {
    try {
      const services = await loadAllServicesFromCSV();
      setAllServices(services);
    } catch (error) {
      console.error('Error loading all services:', error);
      setAllServices(mockServices);
    }
  };

  useEffect(() => {
    const handler = () => {
      try {
        loadBookmarks();
      } catch (error) {
        console.error('Error loading bookmarks on event:', error);
      }
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

        // Dispatch event to notify other components of bookmark changes
        console.log('Bookmarks: Dispatching bookmarks:changed event after removing bookmark');
        window.dispatchEvent(new CustomEvent('bookmarks:changed'));
      } else {
        throw new Error('Failed to remove from database');
      }
    } catch (error) {
      console.error('Failed to remove from bookmarks:', error);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="text-center mb-6 sm:mb-8 px-4">
        <div className="flex items-center justify-center gap-4 mb-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-2">Your Bookmarks</h2>
            <p className="text-sm sm:text-base text-slate-600">Saved services you added to your bookmarks</p>
          </div>
        </div>
        {user && bookmarkedServices.length > 0 && (
          <button
            onClick={() => setShowBudgetBuddy(true)}
            className="inline-flex items-center gap-2 bg-slate-700 text-white px-6 py-3 rounded-lg font-medium hover:bg-slate-800 transition-colors shadow-md hover:shadow-lg"
          >
            <Calculator className="w-5 h-5" />
            Budget Buddy
          </button>
        )}
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
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {bookmarkedServices.map((service) => {
            if (!service) {
              console.error('Invalid service in bookmarks:', service);
              return null;
            }
            return (
              <ServiceCard
                key={service.id}
                service={service}
                isBookmarked={true}
                onToggleBookmark={() => removeLocal(service.id)}
                onViewDetails={() => setSelected(service)}
                viewMode="grid"
                actionIcon={Trash2}
                actionLabel="Remove"
                isBookmarkPage={true}
              />
            );
          })}
        </div>
      )}
      {selected && <ServiceDetails service={selected} onClose={() => setSelected(null)} />}
      {showBudgetBuddy && (
        <BudgetBuddy
          bookmarkedServices={bookmarkedServices}
          allServices={allServices}
          onClose={() => setShowBudgetBuddy(false)}
        />
      )}
    </div>
  );
};
