import React, { useEffect } from 'react';
import { MapPin, Star, X, ExternalLink } from 'lucide-react';
import { Service } from '../data/mockServices';

interface Props {
  service: Service | null;
  onClose: () => void;
}

export const ServiceDetails: React.FC<Props> = ({ service, onClose }) => {
  if (!service) return null;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Image Section */}
        <div className="relative w-full h-64">
          {service.image ? (
            <img
              src={service.image}
              alt={service.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-slate-100 flex items-center justify-center">
              <span className="text-slate-400">No image available</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors"
          >
            <X className="w-5 h-5 text-slate-700" />
          </button>
          <div className="absolute bottom-4 left-4 right-4">
            <span className="bg-white/90 backdrop-blur-sm text-slate-700 px-3 py-1 rounded-full text-sm font-semibold capitalize">
              {service.type}
            </span>
          </div>
        </div>

        {/* Content Section */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">
                {service.name}
              </h2>
              <div className="flex items-center space-x-4 text-slate-600">
                <div className="flex items-center space-x-1">
                  <MapPin className="w-4 h-4" />
                  <span>{service.city}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span>{service.rating.toFixed(1)}</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-slate-900">
                ₹{service.price.toLocaleString()}
              </div>
              <div className="text-sm text-slate-500">/month</div>
            </div>
          </div>

          <div className="mb-6">
            <h4 className="font-semibold text-slate-900 mb-2">Description</h4>
            <p className="text-slate-700 leading-relaxed">
              {service.description}
            </p>
          </div>

          <div className="mb-6">
            <h4 className="font-semibold text-slate-900 mb-3">
              Features & Amenities
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {service.features.map((feature, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-2 p-2 bg-slate-50 rounded-lg"
                >
                  <div className="w-2 h-2 bg-slate-700 rounded-full"></div>
                  <span className="text-sm text-slate-700">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {service.meta && (
            <div className="mb-6">
              <h4 className="font-semibold text-slate-900 mb-3">
                Additional Details
              </h4>
              <div className="bg-slate-50 rounded-xl p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  {Object.entries(service.meta)
                    .filter(([, v]) => {
                      const s = String(v ?? '').trim();
                      if (!s) return false;
                      const bad = ['n/a', 'na', 'none', '-'];
                      return !bad.includes(s.toLowerCase());
                    })
                    .map(([k, v]) => (
                      <div key={k} className="flex flex-col space-y-1">
                        <span className="font-medium text-slate-600">{k}</span>
                        <span className="text-slate-900">{String(v)}</span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 p-6 border-t border-slate-200 bg-slate-50">
          <div className="flex items-center justify-between">
            <div>
              <a
                href="#"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-slate-600 hover:text-slate-900 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                <span className="text-sm">View original listing</span>
              </a>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={onClose}
                className="px-6 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors"
              >
                Close
              </button>
              <button
                className="px-6 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                Contact Provider
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceDetails;
