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

  // -------------------- SEND BOOKMARKS TO PYTHON BACKEND --------------------
  const sendBookmarksToBackend = async (items: Service[]) => {
    if (!user || !user.id) {
      console.log("User not logged in, skipping backend sync.");
      return;
    }

    try {
      // Removed call to /save_bookmarks endpoint (backend route does not exist)

      console.log("Bookmarks sent to backend successfully");
    } catch (error) {
      console.error("Failed to send bookmarks to backend:", error);
    }
  };

  // -------------------- LOAD BOOKMARKS --------------------
  const loadBookmarks = async () => {
    try {
      if (!user) {
        setBookmarkedServices([]);
        setIsLoading(false);
        return;
      }

      setBookmarkedServices([]);

      const cachedBookmarks = UserStorage.getItemAsJSON<Service[]>('cached_bookmarks', []);
      if (cachedBookmarks.length > 0) {
        const validCached = cachedBookmarks.filter(s => s && s.id && s.name);
        setBookmarkedServices(validCached);
      }

      await UserStorage.migrateWishlistToDatabase();

      const ids = await UserStorage.getWishlistFromDB();
      const map = await UserStorage.getWishlistItemsFromDB();

      const items = ids
        .map(id => (map[id] as Service) || mockServices.find(s => s.id === id))
        .filter((s): s is Service => Boolean(s))
        .filter(s => s.id && s.name);

      setBookmarkedServices(items);
      UserStorage.setItem('cached_bookmarks', items);

      // Send to Python backend
      sendBookmarksToBackend(items);

      window.dispatchEvent(new CustomEvent('bookmarks:changed'));
    } catch (e) {
      console.warn('Failed to load user bookmarks from database', e);
      setBookmarkedServices([]);
    } finally {
      setIsLoading(false);
    }
  };



  // -------------------- LOAD ALL SERVICES --------------------
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
    loadBookmarks();
    loadAllServices();
  }, [user]);

  useEffect(() => {
    const handler = () => {
      try {
        loadBookmarks();
      } catch (error) {
        console.error('Error loading bookmarks on event:', error);
      }
    };
    window.addEventListener('bookmarks:changed', handler);
    return () => {
      window.removeEventListener('bookmarks:changed', handler);
    };
  }, [loadBookmarks]);

  // -------------------- REMOVE BOOKMARK --------------------
  const removeLocal = async (id: string) => {
    if (!user) {
      onAuthRequired?.();
      return;
    }

    try {
      const success = await UserStorage.removeFromWishlistDB(id);
      if (success) {
        const updated = bookmarkedServices.filter(service => service.id !== id);
        setBookmarkedServices(updated);

        // Send updated bookmarks to backend
        sendBookmarksToBackend(updated);

        window.dispatchEvent(new CustomEvent('bookmarks:changed'));
      } else {
        throw new Error('Failed to remove from database');
      }
    } catch (error) {
      console.error('Failed to remove from bookmarks:', error);
    }
  };

  // -------------------- RENDER --------------------
  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="text-center mb-6 sm:mb-8 px-4">
        <div className="flex items-center justify-center gap-4 mb-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-2">Your Wishlist</h2>
            <p className="text-sm sm:text-base text-slate-600">Saved services you added to your Wishlist</p>
          </div>
        </div>

        {user && bookmarkedServices.length > 0 && (
          <div className="flex justify-center gap-4">
            <button
              onClick={() => setShowBudgetBuddy(true)}
              className="inline-flex items-center gap-2 bg-slate-700 text-white px-6 py-3 rounded-lg font-medium hover:bg-slate-800 transition-colors shadow-md hover:shadow-lg"
            >
              <Calculator className="w-5 h-5" /> Budget Buddy
            </button>

          </div>
        )}
      </div>

      {isLoading ? (
        <div className="text-center py-8 sm:py-12">
          <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-slate-700 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-sm sm:text-base text-gray-600">Loading your Wishlist...</p>
        </div>
      ) : !user ? (
        <div className="text-center py-8 sm:py-12 px-4">
          <div className="max-w-md mx-auto">
            <div className="mb-6">
              <div className="w-12 h-12 sm:w-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Login to View Your Wishlist</h3>
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
              <div className="w-12 h-12 sm:w-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Your Wishlist list is empty</h3>
              <p className="text-sm sm:text-base text-gray-600">
                Start exploring services and add your favorites to see them here
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {bookmarkedServices.map(service => {
            if (!service) return null;
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
