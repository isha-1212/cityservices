import React, { useEffect } from 'react';
import { MapPin, Star, X, ExternalLink } from 'lucide-react';
import { Service } from '../data/mockServices';
import { VAISHNO_LISTING } from '../data/areas/vaishno_devi_circle';
import { SHANTIGRAM_LISTING } from '../data/areas/shantigram';
import { JAGATPUR_LISTING } from '../data/areas/jagatpur';
import { BODAKDEV_LISTING } from '../data/areas/bodakdev';
import { MOTERA_LISTING } from '../data/areas/motera';
import { BOPAL_LISTING } from '../data/areas/bopal';
import { CHANDKHEDA_LISTING } from '../data/areas/chandkheda';
import { SHELA_LISTING } from '../data/areas/shela';
import { CHHARODI_LISTING } from '../data/areas/chharodi';
import { SANAND_LISTING } from '../data/areas/sanand';
import { SHILAJ_LISTING } from '../data/areas/shilaj';
import { TRAGAD_LISTING } from '../data/areas/tragad';
import { VASTRAPUR_LISTING } from '../data/areas/vastrapur';
import { AMBLI_LISTING } from '../data/areas/ambli';
import { PALDI_LISTING } from '../data/areas/paldi';
import { SATELLITE_LISTING } from '../data/areas/satellite';
import { GHUMA_LISTING } from '../data/areas/ghuma';
import { ELLISBRIDGE_LISTING } from '../data/areas/ellisbridge';
import { GOTA_LISTING } from '../data/areas/gota';
import { NAVRANGPURA_LISTING } from '../data/areas/navrangpura';
import { SOLA_LISTING } from '../data/areas/sola';
import { JODHPUR_LISTING } from '../data/areas/jodhpur';
import { MAKARBA_LISTING } from '../data/areas/makarba';
import { VASTRAL_LISTING } from '../data/areas/vastral';
import { NEW_MANINAGAR_LISTING } from '../data/areas/new_maninagar';
import { MAHADEV_NAGAR_LISTING } from '../data/areas/mahadev_nagar';
import { ODHAV_LISTING } from '../data/areas/odhav';
import { RAMOL_LISTING } from '../data/areas/ramol';

interface Props {
    service: Service | null;
    onClose: () => void;
}

export const ServiceDetails: React.FC<Props> = ({ service, onClose }) => {
    if (!service) return null;

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [onClose]);

    const getListingUrl = () => {
        const meta = (service as any).meta || {};
        const locality = ((meta['Locality / Area'] || meta['Locality'] || '') + '').toString().trim().toLowerCase();
        const city = ((meta['City'] || service.city || '') + '').toString().trim().toLowerCase();

        // Check for direct URLs in meta
        const keys = [
            'Contact / Listing Link', 'Contact / Listing', 'Contact/ Listing Link', 'Contact/Listing Link',
            'Contact', 'Contact Link', 'Listing Link', 'listing_link', 'listing link'
        ];
        for (const k of keys) {
            const v = meta[k];
            if (v && typeof v === 'string' && /^https?:\/\//i.test(v.trim())) return v.trim();
        }

        // Scan all meta values for URLs
        for (const v of Object.values(meta)) {
            if (typeof v === 'string') {
                const m = v.match(/https?:\/\/[^\s",)]+/i);
                if (m) return m[0];
            }
        }

        // Area-specific fallbacks for Ahmedabad
        const areaMap: Record<string, string> = {
            'vaishno devi circle': VAISHNO_LISTING,
            'shantigram': SHANTIGRAM_LISTING,
            'jagatpur': JAGATPUR_LISTING,
            'bodakdev': BODAKDEV_LISTING,
            'motera': MOTERA_LISTING,
            'bopal': BOPAL_LISTING,
            'chandkheda': CHANDKHEDA_LISTING,
            'shela': SHELA_LISTING,
            'chharodi': CHHARODI_LISTING,
            'sanand': SANAND_LISTING,
            'shilaj': SHILAJ_LISTING,
            'tragad': TRAGAD_LISTING,
            'vastrapur': VASTRAPUR_LISTING,
            'ambli': AMBLI_LISTING,
            'paldi': PALDI_LISTING,
            'satellite': SATELLITE_LISTING,
            'ghuma': GHUMA_LISTING,
            'ellisbridge': ELLISBRIDGE_LISTING,
            'gota': GOTA_LISTING,
            'navrangpura': NAVRANGPURA_LISTING,
            'sola': SOLA_LISTING,
            'jodhpur': JODHPUR_LISTING,
            'makarba': MAKARBA_LISTING,
            'vastral': VASTRAL_LISTING,
            'new maninagar': NEW_MANINAGAR_LISTING,
            'mahadev nagar': MAHADEV_NAGAR_LISTING,
            'odhav': ODHAV_LISTING,
            'ramol': RAMOL_LISTING,
        };
        if (city === 'ahmedabad' && locality && areaMap[locality]) return areaMap[locality];
        return null;
    };

    const listingUrl = getListingUrl();

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
            <div 
                className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl animate-slide-up" 
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="relative flex-shrink-0">
                    {service.image ? (
                        <img src={service.image} alt={service.name} className="w-full h-64 object-cover" />
                    ) : (
                        <div className="w-full h-64 bg-slate-100 flex items-center justify-center">
                            <span className="text-slate-400">No image available</span>
                        </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
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

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {/* Title and Rating */}
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                            <h2 className="text-2xl font-bold text-slate-900 mb-2">{service.name}</h2>
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
                            <div className="text-2xl font-bold text-slate-900">₹{service.price.toLocaleString()}</div>
                            <div className="text-sm text-slate-500">/month</div>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="mb-6">
                        <h4 className="font-semibold text-slate-900 mb-2">Description</h4>
                        <p className="text-slate-700 leading-relaxed">{service.description}</p>
                    </div>

                    {/* Features */}
                    <div className="mb-6">
                        <h4 className="font-semibold text-slate-900 mb-3">Features & Amenities</h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                            {service.features.map((feature, index) => (
                                <div key={index} className="flex items-center space-x-2 p-2 bg-slate-50 rounded-lg">
                                    <div className="w-2 h-2 bg-slate-700 rounded-full"></div>
                                    <span className="text-sm text-slate-700">{feature}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Additional Details */}
                    {service.meta && (
                        <div className="mb-6">
                            <h4 className="font-semibold text-slate-900 mb-3">Additional Details</h4>
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

                {/* Footer Actions */}
                <div className="flex-shrink-0 p-6 border-t border-slate-200 bg-slate-50">
                    <div className="flex items-center justify-between">
                        <div>
                            {listingUrl && (
                                <a 
                                    href={listingUrl} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="flex items-center space-x-2 text-slate-600 hover:text-slate-900 transition-colors"
                                >
                                    <ExternalLink className="w-4 h-4" />
                                    <span className="text-sm">View original listing</span>
                                </a>
                            )}
                        </div>
                        <div className="flex items-center space-x-3">
                            <button 
                                onClick={onClose}
                                className="px-6 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors"
                            >
                                Close
                            </button>
                            <button
                                onClick={() => {
                                    if (listingUrl) {
                                        window.open(listingUrl, '_blank', 'noopener');
                                    } else {
                                        onClose();
                                    }
                                }}
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