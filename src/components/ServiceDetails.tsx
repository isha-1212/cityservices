import React, { useEffect } from 'react';
import { MapPin, Star, X, ExternalLink } from 'lucide-react';
import { Service } from '../data/mockServices';
import { areasMap } from '../data/areasMap';

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

    const handleContactProvider = () => {
        if (service.type === 'accommodation' && service.meta && service.meta['Locality / Area']) {
            const area = service.meta['Locality / Area'];
            const normalizedArea = area.toLowerCase().replace(/\s+/g, '_');
            const url = areasMap[normalizedArea];
            if (url) {
                window.open(url, '_blank');
            } else {
                alert('Area listing not found');
            }
        } else {
            alert('Contact provider not available for this service type');
        }
    };

    // Source tag logic
    let sourceTag = 'General';
    if (service.type === 'accommodation') sourceTag = 'Housing.com';
    else if (service.type === 'food') {
        // Check if it's Gujarat food data or Swiggy data
        if (service.meta && service.meta['platform']) {
            sourceTag = service.meta['platform']; // Swiggy, Zomato, UberEats
        } else {
            sourceTag = 'Swiggy'; // Default for old Swiggy data
        }
    }
    else if (service.type === 'tiffin') sourceTag = 'General';

    return (
        <div
            className="fixed inset-0 z-[1001] flex items-center justify-center p-2 sm:p-4 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-xl sm:rounded-2xl w-full max-w-2xl max-h-[95vh] sm:max-h-[90vh] flex flex-col overflow-hidden shadow-2xl animate-slide-up"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Image Section */}
                <div className="relative w-full h-48 sm:h-56 md:h-64">
                    {/* Source tag badge */}
                    <span className="absolute top-4 left-4 z-10 bg-slate-200 text-slate-900 text-xs font-semibold px-2 py-1 rounded shadow-md">
                        {sourceTag}
                    </span>
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
                    <div className="absolute bottom-2 sm:bottom-4 left-2 sm:left-4 right-2 sm:right-4">
                        <span className="bg-white/90 backdrop-blur-sm text-slate-700 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-semibold capitalize">
                            {service.type}
                        </span>
                    </div>
                </div>

                {/* Content Section */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row items-start justify-between gap-3 mb-4">
                        <div className="flex-1">
                            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-slate-900 mb-2">
                                {service.name}
                            </h2>
                            <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-slate-600">
                                <div className="flex items-center space-x-1">
                                    <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
                                    <span className="text-sm sm:text-base">{service.city}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                    <Star className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400 fill-current" />
                                    <span className="text-sm sm:text-base">{service.rating.toFixed(1)}</span>
                                </div>
                            </div>
                        </div>
                        <div className="text-left sm:text-right">
                            <div className="text-xl sm:text-2xl font-bold text-slate-900">
                                ₹{service.price.toLocaleString()}
                            </div>
                            <div className="text-xs sm:text-sm text-slate-500">/month</div>
                        </div>
                    </div>

                    <div className="mb-4 sm:mb-6">
                        <h4 className="text-sm sm:text-base font-semibold text-slate-900 mb-2">Description</h4>
                        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                            {service.description}
                        </p>
                    </div>

                    <div className="mb-4 sm:mb-6">
                        <h4 className="text-sm sm:text-base font-semibold text-slate-900 mb-2 sm:mb-3">
                            Features & Amenities
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                            {service.features.map((feature, index) => (
                                <div
                                    key={index}
                                    className="flex items-center space-x-2 p-2 bg-slate-50 rounded-lg"
                                >
                                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-slate-700 rounded-full flex-shrink-0"></div>
                                    <span className="text-xs sm:text-sm text-slate-700">{feature}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {service.meta && (
                        <div className="mb-4 sm:mb-6">
                            <h4 className="text-sm sm:text-base font-semibold text-slate-900 mb-2 sm:mb-3">
                                Additional Details
                            </h4>
                            <div className="bg-slate-50 rounded-lg sm:rounded-xl p-3 sm:p-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
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
                                                <span className="text-slate-900 break-words">{String(v)}</span>
                                            </div>
                                        ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex-shrink-0 p-4 sm:p-6 border-t border-slate-200 bg-slate-50">
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                    <div className="flex-1">
                        {/* Removed "View original listing" link as per user request */}
                    </div>
                        <div className="flex items-center space-x-3">
                            <button
                                onClick={handleContactProvider}
                                className="w-full sm:w-auto px-4 sm:px-6 py-2 bg-slate-700 text-white text-sm rounded-lg hover:bg-slate-800 transition-colors"
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
