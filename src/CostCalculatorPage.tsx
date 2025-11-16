import React, { useEffect, useMemo, useState } from 'react';
import { CostCalculator } from './components/CostCalculator';
import { mockServices, Service } from './data/mockServices';
import { UserStorage } from './utils/userStorage';

interface CostCalculatorPageProps {
  user?: any;
}

export const CostCalculatorPage: React.FC<CostCalculatorPageProps> = ({ user }) => {
  const [bookmarkedServices, setBookmarkedServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadWishlistServices = async () => {
      try {
        if (!user) {
          // If no user, show sample services
          setBookmarkedServices(mockServices.slice(0, 12));
          setIsLoading(false);
          return;
        }

        // Fetch wishlist from Supabase
        const ids = await UserStorage.getWishlistFromDB();
        const map = await UserStorage.getWishlistItemsFromDB();

        const items = ids
          .map(id => (map[id] as Service) || mockServices.find(s => s.id === id))
          .filter((s): s is Service => Boolean(s))
          .filter(s => s.id && s.name);

        if (items.length === 0) {
          // If no wishlist items, show sample services
          setBookmarkedServices(mockServices.slice(0, 12));
        } else {
          setBookmarkedServices(items);
        }
      } catch (error) {
        console.error('Error loading wishlist services:', error);
        setBookmarkedServices(mockServices.slice(0, 12));
      } finally {
        setIsLoading(false);
      }
    };

    loadWishlistServices();
  }, [user]);

  const items = useMemo(() => {
    return bookmarkedServices.map(s => ({
      id: s.id || `${s.name}-${s.city}`,
      name: s.name,
      type: s.type,
      price: s.price || 0,
    }));
  }, [bookmarkedServices]);

  const [min, setMin] = useState<number>(() => Number(localStorage.getItem('calc_min_budget') || 0));
  const [max, setMax] = useState<number>(() => Number(localStorage.getItem('calc_max_budget') || 50000));

  useEffect(() => {
    localStorage.setItem('calc_min_budget', String(min || 0));
  }, [min]);
  useEffect(() => {
    localStorage.setItem('calc_max_budget', String(max || 0));
  }, [max]);

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 border-4 border-slate-700 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="mt-4 text-slate-600">Loading your wishlist services...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-slate-900 mb-3">Cost Calculator</h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          {user ? 'Calculate costs based on your wishlist services' : 'Plan your monthly expenses and stay within budget with our smart calculator'}
        </p>
        {!user && (
          <p className="text-sm text-slate-500 mt-2">
            Login to calculate costs from your wishlist
          </p>
        )}
      </div>

      {/* Budget Range Selector */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Set Your Budget Range</h3>
        
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Minimum Budget: ₹{min.toLocaleString()}
              </label>
              <input
                type="range"
                min={0}
                max={100000}
                step={1000}
                value={min}
                onChange={(e) => {
                  const val = Math.min(Number(e.target.value), max - 1000);
                  setMin(val);
                }}
                className="w-full"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Maximum Budget: ₹{max.toLocaleString()}
              </label>
              <input
                type="range"
                min={0}
                max={100000}
                step={1000}
                value={max}
                onChange={(e) => {
                  const val = Math.max(Number(e.target.value), min + 1000);
                  setMax(val);
                }}
                className="w-full"
              />
            </div>
          </div>

          {/* Budget Display */}
          <div className="flex items-center justify-center">
            <div className="bg-slate-100 rounded-xl px-6 py-3">
              <span className="text-slate-600 text-sm">Your Budget Range: </span>
              <span className="font-bold text-slate-900">
                ₹{min.toLocaleString()} - ₹{max.toLocaleString()}/month
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Calculator Component */}
      <CostCalculator selectedServices={items} userBudget={{ min, max }} />
    </div>
  );
};

export default CostCalculatorPage;