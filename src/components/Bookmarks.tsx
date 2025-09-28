import React, { useEffect, useState } from 'react';
import { MapPin, Star, Trash2, Heart } from 'lucide-react';
import mockServices, { Service } from '../data/mockServices';
import { ServiceDetails } from './ServiceDetails';

export const Bookmarks: React.FC = () => {
  const [bookmarkedServices, setBookmarkedServices] = useState<Service[]>([]);
  const [selected, setSelected] = useState<Service | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('local_bookmarks');
      if (raw) {
        const ids: string[] = JSON.parse(raw);
        const rawMap = localStorage.getItem('local_bookmark_items');
        const map: Record<string, any> = rawMap ? JSON.parse(rawMap) : {};
        const items = ids
          .map(id => (map[id] as Service) || mockServices.find(s => s.id === id))
          .filter((s): s is Service => Boolean(s));
        setBookmarkedServices(items);
        return;
      }
    } catch (e) {
      console.warn('Failed to read local_bookmarks', e);
    }
    setBookmarkedServices([]);
  }, []);

  useEffect(() => {
    const handler = () => {
      try {
        const raw = localStorage.getItem('local_bookmarks');
        if (raw) {
          const ids: string[] = JSON.parse(raw);
          const rawMap = localStorage.getItem('local_bookmark_items');
          const map: Record<string, any> = rawMap ? JSON.parse(rawMap) : {};
          const items = ids
            .map(id => (map[id] as Service) || mockServices.find(s => s.id === id))
            .filter((s): s is Service => Boolean(s));
          setBookmarkedServices(items);
          return;
        }
      } catch (e) {
        console.warn('Failed to read local_bookmarks', e);
      }
      setBookmarkedServices([]);
    };
    window.addEventListener('bookmarks:changed', handler);
    return () => window.removeEventListener('bookmarks:changed', handler);
  }, []);

  const removeLocal = (id: string) => {
    const next = bookmarkedServices.filter(x => x.id !== id);
    setBookmarkedServices(next);
    try {
      localStorage.setItem('local_bookmarks', JSON.stringify(next.map(x => x.id)));
      window.dispatchEvent(new CustomEvent('bookmarks:changed'));
      window.dispatchEvent(new CustomEvent('toast:show', { 
        detail: { message: 'Removed from bookmarks', type: 'success' } 
      }));
    } catch (e) { }

    // Backend sync if logged in
    const token = localStorage.getItem('token');
    if (!token) return;

    (async () => {
      try {
        const res = await fetch('/api/bookmarks', { headers: { 'Authorization': `Bearer ${token}` } });
        if (!res.ok) return;
        const data = await res.json();
        const found = (data.bookmarks || []).find((b: any) => b.service_id === id);
        if (!found) return;
        const del = await fetch(`/api/bookmarks/${found.id}`, { 
          method: 'DELETE', 
          headers: { 'Authorization': `Bearer ${token}` } 
        });
        if (!del.ok) {
          console.warn('Backend failed to delete bookmark', await del.text());
          window.dispatchEvent(new CustomEvent('toast:show', { 
            detail: { message: 'Failed to remove from server', type: 'error' } 
          }));
        }
      } catch (err) {
        console.error('Failed to remove bookmark from backend', err);
      }
    })();
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-slate-900 mb-3">Your Bookmarks</h1>
        <p className="text-lg text-slate-600">
          Services you've saved for later consideration
        </p>
      </div>

      {/* Bookmarks Grid */}
      {bookmarkedServices.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-xl font-semibold text-slate-900 mb-2">No bookmarks yet</h3>
          <p className="text-slate-600 mb-6">Start exploring services and bookmark the ones you like</p>
          <button className="px-6 py-3 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition-colors">
            Explore Services
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bookmarkedServices.map((service) => (
            <div key={service.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-200 card-hover">
              {/* Image */}
              <div className="relative">
                <img src={service.image} alt={service.name} className="w-full h-48 object-cover" />
                <div className="absolute top-3 left-3">
                  <span className="bg-white/90 backdrop-blur-sm text-slate-700 px-3 py-1 rounded-full text-xs font-semibold capitalize">
                    {service.type}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-semibold text-slate-900 line-clamp-2 flex-1 mr-2">
                    {service.name}
                  </h3>
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-sm text-slate-600">{service.rating.toFixed(1)}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 mb-3">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  <span className="text-sm text-slate-600">{service.city}</span>
                </div>

                <p className="text-slate-600 text-sm mb-4 line-clamp-2">{service.description}</p>

                {/* Features */}
                <div className="flex flex-wrap gap-1 mb-4">
                  {service.features.slice(0, 3).map((feature, index) => (
                    <span key={index} className="bg-slate-100 text-slate-700 px-2 py-1 rounded-md text-xs">
                      {feature}
                    </span>
                  ))}
                  {service.features.length > 3 && (
                    <span className="bg-slate-100 text-slate-700 px-2 py-1 rounded-md text-xs">
                      +{service.features.length - 3} more
                    </span>
                  )}
                </div>

                {/* Price and Actions */}
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xl font-bold text-slate-900">₹{service.price.toLocaleString()}</span>
                    <span className="text-sm text-slate-500 ml-1">/month</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={() => setSelected(service)} 
                      className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors"
                    >
                      View Details
                    </button>
                    <button 
                      onClick={() => removeLocal(service.id)} 
                      className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Service Details Modal */}
      {selected && <ServiceDetails service={selected} onClose={() => setSelected(null)} />}
    </div>
  );
};