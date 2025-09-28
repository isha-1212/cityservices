import React, { useState, useEffect, useMemo } from 'react';
import { Search, Filter, MapPin, Star, Heart, Grid2x2 as Grid, List, SlidersHorizontal } from 'lucide-react';
import Papa from 'papaparse';
import mockServices, { Service } from '../data/mockServices';
import { ServiceDetails } from './ServiceDetails';

// Area image mappings
import { VAISHNO_IMAGE } from '../data/areas/vaishno_devi_circle';
import { SHANTIGRAM_IMAGE } from '../data/areas/shantigram';
import { JAGATPUR_IMAGE } from '../data/areas/jagatpur';
import { BODAKDEV_IMAGE } from '../data/areas/bodakdev';
import { MOTERA_IMAGE } from '../data/areas/motera';
import { BOPAL_IMAGE } from '../data/areas/bopal';
import { CHANDKHEDA_IMAGE } from '../data/areas/chandkheda';
import { SHELA_IMAGE } from '../data/areas/shela';
import { CHHARODI_IMAGE } from '../data/areas/chharodi';
import { SANAND_IMAGE } from '../data/areas/sanand';
import { SHILAJ_IMAGE } from '../data/areas/shilaj';
import { TRAGAD_IMAGE } from '../data/areas/tragad';
import { VASTRAPUR_IMAGE } from '../data/areas/vastrapur';
import { AMBLI_IMAGE } from '../data/areas/ambli';
import { PALDI_IMAGE } from '../data/areas/paldi';
import { SATELLITE_IMAGE } from '../data/areas/satellite';
import { GHUMA_IMAGE } from '../data/areas/ghuma';
import { ELLISBRIDGE_IMAGE } from '../data/areas/ellisbridge';
import { GOTA_IMAGE } from '../data/areas/gota';
import { NAVRANGPURA_IMAGE } from '../data/areas/navrangpura';
import { SOLA_IMAGE } from '../data/areas/sola';
import { JODHPUR_IMAGE } from '../data/areas/jodhpur';
import { MAKARBA_IMAGE } from '../data/areas/makarba';
import { VASTRAL_IMAGE } from '../data/areas/vastral';
import { NEW_MANINAGAR_IMAGE } from '../data/areas/new_maninagar';
import { MAHADEV_NAGAR_IMAGE } from '../data/areas/mahadev_nagar';
import { ODHAV_IMAGE } from '../data/areas/odhav';
import { RAMOL_IMAGE } from '../data/areas/ramol';

const ServiceSearch: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState([0, 100000]);
  const [minRating, setMinRating] = useState(0);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());
  const [csvServices, setCsvServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);

  // Load bookmarks from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem('local_bookmarks');
      if (raw) setBookmarkedIds(new Set(JSON.parse(raw)));
    } catch (e) {
      console.warn('Failed to load bookmarks', e);
    }
  }, []);

  // Load CSV data
  useEffect(() => {
    const loadCsvData = async () => {
      setLoading(true);
      try {
        const [accommodationRes, foodRes] = await Promise.all([
          fetch('/data/Accomodation/Ahmedabad-with-images.csv'),
          fetch('/data/Food/tifin_rental.csv')
        ]);

        const [accommodationText, foodText] = await Promise.all([
          accommodationRes.text(),
          foodRes.text()
        ]);

        const services: Service[] = [];

        // Parse accommodation data
        Papa.parse(accommodationText, {
          header: true,
          complete: (results) => {
            results.data.forEach((row: any, idx: number) => {
              if (!row.City || !row['Rent Price']) return;

              const locality = (row['Locality / Area'] || '').toLowerCase().trim();
              const areaImageMap: Record<string, string> = {
                'vaishno devi circle': VAISHNO_IMAGE,
                'shantigram': SHANTIGRAM_IMAGE,
                'jagatpur': JAGATPUR_IMAGE,
                'bodakdev': BODAKDEV_IMAGE,
                'motera': MOTERA_IMAGE,
                'bopal': BOPAL_IMAGE,
                'chandkheda': CHANDKHEDA_IMAGE,
                'shela': SHELA_IMAGE,
                'chharodi': CHHARODI_IMAGE,
                'sanand': SANAND_IMAGE,
                'shilaj': SHILAJ_IMAGE,
                'tragad': TRAGAD_IMAGE,
                'vastrapur': VASTRAPUR_IMAGE,
                'ambli': AMBLI_IMAGE,
                'paldi': PALDI_IMAGE,
                'satellite': SATELLITE_IMAGE,
                'ghuma': GHUMA_IMAGE,
                'ellisbridge': ELLISBRIDGE_IMAGE,
                'gota': GOTA_IMAGE,
                'navrangpura': NAVRANGPURA_IMAGE,
                'sola': SOLA_IMAGE,
                'jodhpur': JODHPUR_IMAGE,
                'makarba': MAKARBA_IMAGE,
                'vastral': VASTRAL_IMAGE,
                'new maninagar': NEW_MANINAGAR_IMAGE,
                'mahadev nagar': MAHADEV_NAGAR_IMAGE,
                'odhav': ODHAV_IMAGE,
                'ramol': RAMOL_IMAGE,
              };

              const service: Service = {
                id: `accommodation-${idx}`,
                name: `${row['Property Type']} - ${row['Locality / Area']}`,
                type: 'accommodation',
                city: row['City'],
                price: Number(row['Rent Price']) || 0,
                rating: 4.2 + Math.random() * 0.6,
                description: `${row['Bedrooms']} ${row['Property Type']} in ${row['Locality / Area']}, ${row['Furnishing Status']}`,
                image: row.image || areaImageMap[locality] || 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=400',
                features: (row['Amenities'] || '').split(',').map((f: string) => f.trim()).filter(Boolean),
                meta: row
              };
              services.push(service);
            });
          }
        });

        // Parse food data
        Papa.parse(foodText, {
          header: true,
          complete: (results) => {
            results.data.forEach((row: any, idx: number) => {
              if (!row.Name) return;

              const priceRange = row['Estimated_Price_Per_Tiffin_INR'] || '₹70 - ₹120';
              const avgPrice = priceRange.includes('-')
                ? (parseInt(priceRange.split('-')[0].replace(/[^\d]/g, '')) + parseInt(priceRange.split('-')[1].replace(/[^\d]/g, ''))) / 2
                : parseInt(priceRange.replace(/[^\d]/g, '')) || 95;

              const service: Service = {
                id: `tiffin-${idx}`,
                name: row.Name,
                type: 'tiffin',
                city: row.City || 'Ahmedabad',
                price: avgPrice * 30, // Monthly cost
                rating: Number(row.Rating) || 4.5,
                description: row.Address || 'Tiffin service provider',
                image: row.Menu || 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400',
                features: [row.Type || 'Tiffin Service', row.Hours || 'Daily Service'].filter(Boolean),
                meta: row
              };
              services.push(service);
            });
          }
        });

        setCsvServices(services);
      } catch (error) {
        console.error('Failed to load CSV data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCsvData();
  }, []);

  // Combine and filter services
  const allServices = useMemo(() => [...mockServices, ...csvServices], [csvServices]);

  const filteredServices = useMemo(() => {
    return allServices.filter(service => {
      const matchesQuery = !searchQuery ||
        service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCity = !selectedCity || service.city === selectedCity;
      const matchesType = selectedTypes.length === 0 || selectedTypes.includes(service.type);
      const matchesPrice = service.price >= priceRange[0] && service.price <= priceRange[1];
      const matchesRating = service.rating >= minRating;

      return matchesQuery && matchesCity && matchesType && matchesPrice && matchesRating;
    });
  }, [allServices, searchQuery, selectedCity, selectedTypes, priceRange, minRating]);

  const cities = [...new Set(allServices.map(s => s.city))].sort();
  const serviceTypes = [...new Set(allServices.map(s => s.type))].sort();

  const toggleServiceType = (type: string) => {
    setSelectedTypes(prev =>
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  const toggleBookmark = (serviceId: string, service: Service) => {
    const newBookmarksSet = new Set(bookmarkedIds);
    const isCurrentlyBookmarked = bookmarkedIds.has(serviceId);

    if (isCurrentlyBookmarked) {
      newBookmarksSet.delete(serviceId);
    } else {
      newBookmarksSet.add(serviceId);
      // Store service data for dynamic items
      try {
        const existingMap = JSON.parse(localStorage.getItem('local_bookmark_items') || '{}');
        existingMap[serviceId] = service;
        localStorage.setItem('local_bookmark_items', JSON.stringify(existingMap));
      } catch (e) {
        console.warn('Failed to store bookmark item', e);
      }
    }

    setBookmarkedIds(newBookmarksSet);
    localStorage.setItem('local_bookmarks', JSON.stringify([...newBookmarksSet]));
    window.dispatchEvent(new CustomEvent('bookmarks:changed'));

    const message = isCurrentlyBookmarked ? 'Removed from bookmarks' : 'Added to bookmarks';
    window.dispatchEvent(new CustomEvent('toast:show', {
      detail: { message, type: 'success' }
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-slate-900 mb-3">Find Services</h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          Discover the best city services tailored to your needs and budget
        </p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        {/* Search Bar */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search services, cities, or areas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-700 focus:border-slate-700 text-slate-900 placeholder-slate-500"
          />
        </div>

        {/* Filter Toggle */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 px-4 py-2 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
          >
            <SlidersHorizontal className="w-4 h-4 text-slate-600" />
            <span className="text-sm font-medium text-slate-700">Filters</span>
          </button>

          <div className="flex items-center space-x-3">
            <span className="text-sm text-slate-600">{filteredServices.length} results</span>
            <div className="flex items-center space-x-1 bg-slate-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-white shadow-sm text-slate-700' : 'text-slate-500'
                  }`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-colors ${viewMode === 'list' ? 'bg-white shadow-sm text-slate-700' : 'text-slate-500'
                  }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-xl animate-slide-up">
            {/* City Filter */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">City</label>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-700 focus:border-slate-700 bg-white"
              >
                <option value="">All Cities</option>
                {cities.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>

            {/* Service Type Filter */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Service Type</label>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {serviceTypes.map(type => (
                  <label key={type} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedTypes.includes(type)}
                      onChange={() => toggleServiceType(type)}
                      className="w-4 h-4 text-slate-700 border-slate-300 rounded focus:ring-2 focus:ring-slate-700 focus:ring-offset-0"
                    />
                    <span className="text-sm text-slate-700">
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Price Range: ₹{priceRange[0].toLocaleString()} - ₹{priceRange[1].toLocaleString()}
              </label>
              <div className="space-y-2">
                <input
                  type="range"
                  min={0}
                  max={100000}
                  step={1000}
                  value={priceRange[0]}
                  onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                  className="w-full"
                />
                <input
                  type="range"
                  min={0}
                  max={100000}
                  step={1000}
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                  className="w-full"
                />
              </div>
            </div>

            {/* Rating Filter */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Min Rating: {minRating}★
              </label>
              <input
                type="range"
                min={0}
                max={5}
                step={0.5}
                value={minRating}
                onChange={(e) => setMinRating(Number(e.target.value))}
                className="w-full"
              />
            </div>
          </div>
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <div className="inline-block w-8 h-8 border-4 border-slate-200 border-t-slate-700 rounded-full animate-spin"></div>
          <p className="text-slate-600 mt-4">Loading services...</p>
        </div>
      )}

      {/* Results */}
      {!loading && (
        <div className={`grid gap-6 ${viewMode === 'grid'
            ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
            : 'grid-cols-1'
          }`}>
          {filteredServices.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              isBookmarked={bookmarkedIds.has(service.id)}
              onToggleBookmark={() => toggleBookmark(service.id, service)}
              onViewDetails={() => setSelectedService(service)}
              viewMode={viewMode}
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredServices.length === 0 && (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-xl font-semibold text-slate-900 mb-2">No services found</h3>
          <p className="text-slate-600 mb-6">Try adjusting your filters or search terms</p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCity('');
              setSelectedTypes([]);
              setPriceRange([0, 100000]);
              setMinRating(0);
            }}
            className="px-6 py-3 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            Clear All Filters
          </button>
        </div>
      )}

      {/* Service Details Modal */}
      {selectedService && (
        <ServiceDetails
          service={selectedService}
          onClose={() => setSelectedService(null)}
        />
      )}
    </div>
  );
};

// Service Card Component
interface ServiceCardProps {
  service: Service;
  isBookmarked: boolean;
  onToggleBookmark: () => void;
  onViewDetails: () => void;
  viewMode: 'grid' | 'list';
}

const ServiceCard: React.FC<ServiceCardProps> = ({
  service,
  isBookmarked,
  onToggleBookmark,
  onViewDetails,
  viewMode
}) => {
  if (viewMode === 'list') {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-all duration-300">
        <div className="flex items-center space-x-6">
          <img
            src={service.image}
            alt={service.name}
            className="w-24 h-24 rounded-lg object-cover flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 truncate">{service.name}</h3>
                <div className="flex items-center space-x-4 mt-1">
                  <div className="flex items-center space-x-1">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    <span className="text-sm text-slate-600">{service.city}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-sm text-slate-600">{service.rating.toFixed(1)}</span>
                  </div>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="text-xl font-bold text-slate-900">₹{service.price.toLocaleString()}</div>
                <div className="text-sm text-slate-500">/month</div>
              </div>
            </div>
            <p className="text-slate-600 text-sm mb-3 line-clamp-2">{service.description}</p>
            <div className="flex items-center justify-between">
              <div className="flex flex-wrap gap-1">
                <span className="bg-slate-100 text-slate-700 px-2 py-1 rounded-md text-xs font-medium capitalize">
                  {service.type}
                </span>
                {service.features.slice(0, 2).map((feature, index) => (
                  <span key={index} className="bg-slate-100 text-slate-700 px-2 py-1 rounded-md text-xs">
                    {feature}
                  </span>
                ))}
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={onViewDetails}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors"
                >
                  View Details
                </button>
                <button
                  onClick={onToggleBookmark}
                  className={`p-2 rounded-lg transition-colors ${isBookmarked
                      ? 'bg-red-100 text-red-600 hover:bg-red-200'
                      : 'bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-red-500'
                    }`}
                >
                  <Heart className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-200 card-hover">
      {/* Image */}
      <div className="relative">
        <img
          src={service.image}
          alt={service.name}
          className="w-full h-48 object-cover"
        />
        <div className="absolute top-3 left-3">
          <span className="bg-white/90 backdrop-blur-sm text-slate-700 px-3 py-1 rounded-full text-xs font-semibold capitalize">
            {service.type}
          </span>
        </div>
        <button
          onClick={onToggleBookmark}
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-sm transition-all duration-200 ${isBookmarked
              ? 'bg-red-500 text-white'
              : 'bg-white/90 text-slate-400 hover:text-red-500'
            }`}
        >
          <Heart className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
        </button>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-lg font-semibold text-slate-900 line-clamp-2 flex-1 mr-2">
            {service.name}
          </h3>
          <div className="text-right flex-shrink-0">
            <div className="text-lg font-bold text-slate-900">₹{service.price.toLocaleString()}</div>
            <div className="text-xs text-slate-500">/month</div>
          </div>
        </div>

        <div className="flex items-center space-x-4 mb-3">
          <div className="flex items-center space-x-1">
            <MapPin className="w-4 h-4 text-slate-400" />
            <span className="text-sm text-slate-600">{service.city}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Star className="w-4 h-4 text-yellow-400 fill-current" />
            <span className="text-sm text-slate-600">{service.rating.toFixed(1)}</span>
          </div>
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

        {/* Actions */}
        <button
          onClick={onViewDetails}
          className="w-full bg-slate-700 text-white py-3 rounded-lg font-medium hover:bg-slate-800 transition-colors"
        >
          View Details
        </button>
      </div>
    </div>
  );
};

export default ServiceSearch;