import React, { useState, useEffect, useMemo } from 'react';
import { Search, Filter, MapPin, Star, Heart, Grid2x2 as Grid, List, SlidersHorizontal, ChevronDown, X } from 'lucide-react';
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

// Food image mappings for common food keywords
const foodImageMappings: { [key: string]: string } = {
  pizza: 'https://content.jdmagicbox.com/comp/def_content/pizza_outlets/default-pizza-outlets-3.jpg',
  chicken: 'https://recipes.timesofindia.com/thumb/53096628.cms?imgsize=294753&width=800&height=800',
  burger: 'https://www.shutterstock.com/image-photo/burger-tomateoes-lettuce-pickles-on-600nw-2309539129.jpg',
  fries: 'https://whisperofyum.com/wp-content/uploads/2024/10/whisper-of-yum-homemade-french-fries.jpg',
  roll: 'https://lh4.googleusercontent.com/proxy/EG-kWc7b5gqVrXOriIpVK4ao-jNHc5WfpDzv2g0PV_yIhzAl4tAXAy_9q69f00QG-3odYcWYf2jb7keCIUv5DCp2xp16tSMiXnpn',
  shake: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQCLEHanUKGeUgyUeL11JIOZxhel2wHL6VY0g&s',
  pasta: 'https://img.freepik.com/free-photo/penne-pasta-tomato-sauce-with-chicken-tomatoes-wooden-table_2829-19739.jpg',
  paneer: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ8WO9N5Dqc4qI0F-DpCgZWDUeA3wted-3GMw&s',
  strips: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQZcMaCXgOU152Hb5a2vcnPCmxwI-AFNtyZxg&s',
  pepsi: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRejMClxN69ZmomEGbAJMcI-8CjL8Par3l3og&s',
  bhajipav: 'https://www.cubesnjuliennes.com/wp-content/uploads/2020/07/Instant-Pot-Mumbai-Pav-Bhaji-Recipe.jpg',
  maggi: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRcnHYgh3JBgmJdU8ZYSVj5PJCq8SyiyVubug&s',
  popcorn: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRWh1QyaQlXvE_bi3UJCYX4xo9r__1WgQqgmA&s'
};

// Function to get image based on food name keywords
const getFoodImage = (dishName: string): string => {
  const name = dishName.toLowerCase();

  // Check for pizza variations first (especially from Pizza Hut)
  if (name.includes('pizza') || name.includes('- pizza') || name.includes('pizza hut')) {
    return foodImageMappings.pizza;
  }

  // Check for roll variations (prioritized over chicken)
  if (name.includes('roll') || name.includes('wrap') || name.includes('kathi')) {
    return foodImageMappings.roll;
  }

  if (name.includes('maggi')) {
    return foodImageMappings.maggi;
  }

  // Check for burger variations
  if (name.includes('burger') || name.includes('burg')) {
    return foodImageMappings.burger;
  }

  // Check for chicken variations (including common misspellings)
  if (name.includes('chicken') || name.includes('chiken') || name.includes('tikka') || name.includes('ckn')) {
    return foodImageMappings.chicken;
  }

  // Check for fries variations
  if (name.includes('fries') || name.includes('fry') || name.includes('french')) {
    return foodImageMappings.fries;
  }

  // Check for shake variations
  if (name.includes('shake') || name.includes('smoothie') || name.includes('milkshake')) {
    return foodImageMappings.shake;
  }

  // Check for pasta variations
  if (name.includes('pasta') || name.includes('penne') || name.includes('spaghetti') || name.includes('macaroni')) {
    return foodImageMappings.pasta;
  }

  // Check for paneer variations
  if (name.includes('paneer') || name.includes('cottage cheese') || name.includes('panir')) {
    return foodImageMappings.paneer;
  }

  if (name.includes('popcorn')) {
    return foodImageMappings.popcorn;
  }

  if (name.includes('strips')) {
    return foodImageMappings.strips;
  }

  if (name.includes('pepsi')) {
    return foodImageMappings.pepsi;
  }

  if (name.includes('bhajipav') || name.includes('bhaji pav')) {
    return foodImageMappings.bhajipav;
  }

  // Default fallback image for other food items
  return 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRAD_kasqlYXaDOWO1rCq96ZJ77o2_3xYy1Tw&s';
};

// Helper function to get price unit based on service type
const getPriceUnit = (serviceType: string) => {
  // All services now show monthly pricing for consistency
  return 'per month';
};

// ServiceCombinationCard component for displaying service combinations
const ServiceCombinationCard: React.FC<{
  combination: {
    id: string;
    services: Service[];
    totalPrice: number;
    types: string[];
  };
  onViewDetails: (service: Service) => void;
  onToggleBookmark: (serviceId: string, service: Service) => void;
  isBookmarked: (serviceId: string) => boolean;
}> = ({ combination, onViewDetails, onToggleBookmark, isBookmarked }) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-semibold text-slate-900 mb-1">
            Service Combination
          </h3>
          <div className="flex gap-2">
            {combination.types.map(type => (
              <span key={type} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </span>
            ))}
          </div>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold text-slate-900">
            ₹{combination.totalPrice.toLocaleString()}/month
          </div>
          <div className="text-sm text-green-600 font-medium">
            Combined Monthly Cost
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-3">
        {combination.services.map((service, index) => (
          <div key={service.id} className="border border-slate-100 rounded-lg p-3">
            <div className="flex items-center gap-3 mb-2">
              <img
                src={service.image}
                alt={service.name}
                className="w-12 h-12 rounded-lg object-cover"
              />
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-slate-900 text-sm truncate">
                  {service.name}
                </h4>
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3 text-yellow-400 fill-current" />
                  <span className="text-xs text-slate-600">{service.rating}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-900">
                ₹{service.price.toLocaleString()}{getPriceUnit(service.type) ? ` ${getPriceUnit(service.type)}` : ''}
              </span>
              <div className="flex gap-1">
                <button
                  onClick={() => onToggleBookmark(service.id, service)}
                  className={`p-1 rounded ${isBookmarked(service.id)
                    ? 'text-red-500 hover:bg-red-50'
                    : 'text-slate-400 hover:bg-slate-50'
                    }`}
                >
                  <Heart className={`w-4 h-4 ${isBookmarked(service.id) ? 'fill-current' : ''}`} />
                </button>
                <button
                  onClick={() => onViewDetails(service)}
                  className="px-2 py-1 text-xs bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors"
                >
                  View
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ServiceCard component for individual services
const ServiceCard: React.FC<{
  service: Service;
  isBookmarked: boolean;
  onToggleBookmark: () => void;
  onViewDetails: () => void;
  viewMode: 'grid' | 'list';
}> = ({ service, isBookmarked, onToggleBookmark, onViewDetails, viewMode }) => {
  if (viewMode === 'list') {
    return (
      <div className="bg-white rounded-lg border border-slate-200 p-4 flex items-center gap-4 hover:shadow-md transition-shadow">
        <img
          src={service.image}
          alt={service.name}
          className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-slate-900 mb-1 truncate">{service.name}</h3>
          <div className="flex items-center gap-4 text-sm text-slate-600 mb-2">
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              <span>{service.city}</span>
            </div>
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-yellow-400 fill-current" />
              <span>{service.rating}</span>
            </div>
          </div>
          <p className="text-sm text-slate-600 truncate">{service.description}</p>
        </div>
        <div className="text-right flex-shrink-0">
          <div className="text-lg font-bold text-slate-900">
            ₹{service.price.toLocaleString()}
          </div>
          <div className="text-sm text-slate-600">{getPriceUnit(service.type)}</div>
          <div className="flex gap-2 mt-2">
            <button
              onClick={onToggleBookmark}
              className={`p-2 rounded ${isBookmarked
                ? 'text-red-500 hover:bg-red-50'
                : 'text-slate-400 hover:bg-slate-50'
                }`}
            >
              <Heart className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
            </button>
            <button
              onClick={onViewDetails}
              className="px-3 py-1 bg-slate-900 text-white text-sm rounded hover:bg-slate-800 transition-colors"
            >
              View Details
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Source tag logic
  let sourceTag = 'General';
  if (service.type === 'accommodation') sourceTag = 'Housing.com';
  else if (service.type === 'food') sourceTag = 'Swiggy';
  else if (service.type === 'tiffin') sourceTag = 'General';

  return (
    <div
      className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group flex flex-col"
      onClick={(e) => {
        // Prevent opening details if bookmark button is clicked
        if ((e.target as HTMLElement).closest('button[data-bookmark]')) return;
        onViewDetails();
      }}
      tabIndex={0}
      role="button"
      aria-label={`View details for ${service.name}`}
      style={{ minHeight: '370px' }}
    >
      <div className="relative">
        {/* Source tag badge */}
        <span className="absolute top-3 left-3 z-10 bg-slate-200 text-slate-900 text-xs font-semibold px-2 py-1 rounded shadow-md">
          {sourceTag}
        </span>
        <img
          src={service.image}
          alt={service.name}
          className="w-full h-48 object-cover rounded-xl"
        />
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleBookmark();
          }}
          data-bookmark
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-sm ${isBookmarked
            ? 'bg-red-500/20 text-red-500'
            : 'bg-white/20 text-white hover:bg-white/30'
            }`}
        >
          <Heart className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
        </button>
      </div>

      <div className="flex-1 flex flex-col p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-slate-900 text-lg">{service.name}</h3>
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 text-yellow-400 fill-current" />
            <span className="text-sm text-slate-600">{service.rating}</span>
          </div>
        </div>

        <div className="flex items-center gap-1 text-slate-600 mb-2">
          <MapPin className="w-4 h-4" />
          <span className="text-sm">{service.city}</span>
        </div>

        <p className="text-sm text-slate-600 mb-4 line-clamp-2">{service.description}</p>

        <div className="mt-auto flex items-center justify-between">
          <div>
            <div className="text-xl font-bold text-slate-900">
              ₹{service.price.toLocaleString()}
            </div>
            <div className="text-sm text-slate-600">{getPriceUnit(service.type)}</div>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails();
            }}
            className="px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors"
          >
            View Details
          </button>
        </div>
      </div>
    </div>
  );
};

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

  // New states for enhanced filtering
  const [areaQuery, setAreaQuery] = useState('');
  const [foodQuery, setFoodQuery] = useState('');
  const [showAreaSuggestions, setShowAreaSuggestions] = useState(false);
  const [showFoodSuggestions, setShowFoodSuggestions] = useState(false);
  const [serviceTypeDropdownOpen, setServiceTypeDropdownOpen] = useState(false);
  const [activeView, setActiveView] = useState<'combined' | 'individual'>('combined');

  // Area suggestions for Ahmedabad
  const areaSuggestions = [
    'Vaishno Devi Circle', 'Shantigram', 'Jagatpur', 'Bodakdev', 'Motera', 'Bopal',
    'Chandkheda', 'Shela', 'Chharodi', 'Sanand', 'Shilaj', 'Tragad', 'Vastrapur',
    'Ambli', 'Paldi', 'Satellite', 'Ghuma', 'Ellisbridge', 'Gota', 'Navrangpura',
    'Sola', 'Jodhpur', 'Makarba', 'Vastral', 'New Maninagar', 'Mahadev Nagar',
    'Odhav', 'Ramol', 'Vejalpur', 'Vijay Nagar', 'Vavol'
  ];

  // Food type suggestions
  const foodSuggestions = [
    'Gujarati Thali', 'South Indian', 'North Indian', 'Chinese', 'Pizza', 'Burger',
    'Tiffin Service', 'Home Cooked', 'Vegan', 'Jain Food', 'Continental', 'Fast Food'
  ];

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
        const [accommodationRes, tiffinRes, swiggyRes] = await Promise.all([
          fetch('/data/Accomodation/Ahmedabad-with-images.csv'),
          fetch('/data/Food/tifin_rental.csv'),
          fetch('/data/Food/swiggy_Ahm.csv')
        ]);

        const [accommodationText, tiffinText, swiggyText] = await Promise.all([
          accommodationRes.text(),
          tiffinRes.text(),
          swiggyRes.text()
        ]);

        const services: Service[] = [];
        const seenServices = new Set<string>(); // Track unique services

        // Parse accommodation data
        Papa.parse(accommodationText, {
          header: true,
          complete: (results: any) => {
            results.data.forEach((row: any, idx: number) => {
              if (!row.City || !row['Rent Price']) return;

              // Create unique identifier for this service
              const serviceKey = `accommodation-${row.City}-${row['Locality / Area']}-${row['Rent Price']}-${row['Property Type']}`;
              if (seenServices.has(serviceKey)) return; // Skip duplicates
              seenServices.add(serviceKey);

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
                id: `accommodation-${Date.now()}-${idx}`, // More unique ID
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

        // Parse tiffin data
        Papa.parse(tiffinText, {
          header: true,
          complete: (results: any) => {
            results.data.forEach((row: any, idx: number) => {
              if (!row.Name) return;

              // Create unique identifier for this service
              const serviceKey = `tiffin-${row.Name}-${row.City || 'Ahmedabad'}-${row.Address || ''}`;
              if (seenServices.has(serviceKey)) return; // Skip duplicates
              seenServices.add(serviceKey);

              const priceRange = row['Estimated_Price_Per_Tiffin_INR'] || '₹70 - ₹120';
              const avgPrice = priceRange.includes('-')
                ? (parseInt(priceRange.split('-')[0].replace(/[^\d]/g, '')) + parseInt(priceRange.split('-')[1].replace(/[^\d]/g, ''))) / 2
                : parseInt(priceRange.replace(/[^\d]/g, '')) || 95;

              const service: Service = {
                id: `tiffin-${Date.now()}-${idx}`, // More unique ID
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

        // Parse Swiggy food data
        Papa.parse(swiggyText, {
          header: true,
          complete: (results: any) => {
            // Sample the data to avoid too many items (take first 500 items)
            const allData = results.data || [];
            const categoryGroups: Record<string, any[]> = {};

            allData.forEach((item: any) => {
              const category = item['Category'] || 'Other';
              if (!categoryGroups[category]) categoryGroups[category] = [];
              categoryGroups[category].push(item);
            });

            const categories = Object.keys(categoryGroups);
            const totalDesired = 500;
            const sampledData: any[] = [];
            const itemsPerCategory = Math.floor(totalDesired / categories.length);
            const remainder = totalDesired % categories.length;

            categories.forEach((category, index) => {
              const categoryItems = categoryGroups[category];
              const itemsToTake = itemsPerCategory + (index < remainder ? 1 : 0);
              const taken = categoryItems.slice(0, Math.min(itemsToTake, categoryItems.length));
              sampledData.push(...taken);
            });

            sampledData.forEach((row: any, idx: number) => {
              if (!row['Dish Name']) return;

              const serviceKey = `food-${row['Dish Name']}-${row['Restaurant Name']}-${row['Location']}`;
              if (seenServices.has(serviceKey)) return; // Skip duplicates
              seenServices.add(serviceKey);

              const price = Number(row['Price (INR)']) || 0;
              const rating = Number(row['Rating']) || 0;
              const ratingCount = Number(row['Rating Count']) || 0;
              const dishName = row['Dish Name'] || 'Unknown Dish';

              const service: Service = {
                id: `food-${Date.now()}-${idx}`,
                name: `${dishName} - ${row['Restaurant Name']}`,
                type: 'food',
                city: row['City'] || 'Ahmedabad',
                price: price * 15, // Convert to monthly cost (assuming 15 orders per month)
                rating: rating > 0 ? rating : 4.2 + Math.random() * 0.6,
                description: `${row['Category']} dish from ${row['Restaurant Name']} in ${row['Location']}. ${ratingCount > 0 ? `Based on ${ratingCount} ratings.` : ''} (₹${price}/item, ~15 orders/month)`,
                image: getFoodImage(dishName),
                features: [row['Restaurant Name'], row['Location'], row['Category']].filter(Boolean),
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

  // Combine and filter services - Remove duplicates by ID
  const allServices = useMemo(() => {
    const combined = [...mockServices, ...csvServices];
    const seen = new Set<string>();
    return combined.filter(service => {
      if (seen.has(service.id)) {
        return false;
      }
      seen.add(service.id);
      return true;
    });
  }, [csvServices]);

  // Enhanced filtering logic
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

      // Area filtering (only for accommodation)
      const matchesArea = !areaQuery ||
        !selectedTypes.includes('accommodation') ||
        (service.meta && (
          (service.meta['Locality / Area'] || '').toLowerCase().includes(areaQuery.toLowerCase()) ||
          (service.meta['Area'] || '').toLowerCase().includes(areaQuery.toLowerCase())
        )) ||
        service.name.toLowerCase().includes(areaQuery.toLowerCase()) ||
        service.description.toLowerCase().includes(areaQuery.toLowerCase());

      // Food filtering (only for food/tiffin services)
      const matchesFood = !foodQuery ||
        (!selectedTypes.includes('food') && !selectedTypes.includes('tiffin')) ||
        service.name.toLowerCase().includes(foodQuery.toLowerCase()) ||
        service.description.toLowerCase().includes(foodQuery.toLowerCase()) ||
        service.features.some(feature => feature.toLowerCase().includes(foodQuery.toLowerCase()));

      return matchesQuery && matchesCity && matchesType && matchesPrice && matchesRating && matchesArea && matchesFood;
    });
  }, [allServices, searchQuery, selectedCity, selectedTypes, priceRange, minRating, areaQuery, foodQuery]);

  const cities = [...new Set(allServices.map(s => s.city))].sort();
  const serviceTypes = [
    { value: 'accommodation', label: 'Accommodation' },
    { value: 'food', label: 'Food' },
    { value: 'tiffin', label: 'Tiffin Service' },
    { value: 'transport', label: 'Transport' },
    { value: 'coworking', label: 'Co-working' },
    { value: 'utilities', label: 'Utilities' }
  ];

  const toggleServiceType = (type: string) => {
    setSelectedTypes(prev => {
      const newTypes = prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type];

      // Reset area and food queries when service types change
      if (!newTypes.includes('accommodation')) setAreaQuery('');
      if (!newTypes.includes('food') && !newTypes.includes('tiffin')) setFoodQuery('');

      return newTypes;
    });
  };

  const removeServiceType = (type: string) => {
    setSelectedTypes(prev => prev.filter(t => t !== type));
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

  // Filter area suggestions based on query - PREFIX MATCH ONLY
  const filteredAreaSuggestions = areaSuggestions.filter(area =>
    area.toLowerCase().startsWith(areaQuery.toLowerCase())
  );

  // Filter food suggestions based on query - PREFIX MATCH ONLY
  const filteredFoodSuggestions = foodSuggestions.filter(food =>
    food.toLowerCase().startsWith(foodQuery.toLowerCase())
  );

  // Create service combinations when multiple types are selected
  const serviceCombinations = useMemo(() => {
    console.log('=== SERVICE COMBINATION USEMEMO TRIGGERED ===');
    console.log('Selected Types Length:', selectedTypes.length);
    console.log('Selected Types:', selectedTypes);
    console.log('All Services Count:', allServices.length);

    if (selectedTypes.length <= 1) {
      console.log('❌ Not enough service types selected for combinations');
      return [];
    }

    const combinations: Array<{
      id: string;
      services: Service[];
      totalPrice: number;
      types: string[];
    }> = [];

    // Filter services to ONLY include the selected types
    const relevantServices = allServices.filter(service => {
      const matchesType = selectedTypes.includes(service.type);
      const matchesCity = !selectedCity || service.city === selectedCity;
      const matchesRating = service.rating >= minRating;

      // Area filtering (only for accommodation)
      const matchesArea = !areaQuery ||
        !selectedTypes.includes('accommodation') ||
        (service.meta && (
          (service.meta['Locality / Area'] || '').toLowerCase().includes(areaQuery.toLowerCase()) ||
          (service.meta['Area'] || '').toLowerCase().includes(areaQuery.toLowerCase())
        )) ||
        service.name.toLowerCase().includes(areaQuery.toLowerCase()) ||
        service.description.toLowerCase().includes(areaQuery.toLowerCase());

      // Food filtering (only for food/tiffin services)
      const matchesFood = !foodQuery ||
        (!selectedTypes.includes('food') && !selectedTypes.includes('tiffin')) ||
        service.name.toLowerCase().includes(foodQuery.toLowerCase()) ||
        service.description.toLowerCase().includes(foodQuery.toLowerCase()) ||
        (service.meta && (
          (service.meta['Dish Name'] || '').toLowerCase().includes(foodQuery.toLowerCase()) ||
          (service.meta['Category'] || '').toLowerCase().includes(foodQuery.toLowerCase()) ||
          (service.meta['Restaurant Name'] || '').toLowerCase().includes(foodQuery.toLowerCase())
        ));

      return matchesType && matchesCity && matchesRating && matchesArea && matchesFood;
    });

    // Group services by type (only for selected types)
    const servicesByType: Record<string, Service[]> = {};
    relevantServices.forEach(service => {
      if (selectedTypes.includes(service.type)) {
        if (!servicesByType[service.type]) {
          servicesByType[service.type] = [];
        }
        servicesByType[service.type].push(service);
      }
    });

    // Debug: Log the services by type
    if (selectedTypes.length > 1) {
      console.log('=== COMBINATION DEBUG ===');
      console.log('Selected Types:', selectedTypes);
      console.log('Relevant Services Count:', relevantServices.length);

      // Show sample of each service type
      const serviceTypeBreakdown: Record<string, Service[]> = {};
      relevantServices.forEach(service => {
        if (!serviceTypeBreakdown[service.type]) {
          serviceTypeBreakdown[service.type] = [];
        }
        serviceTypeBreakdown[service.type].push(service);
      });

      console.log('Services by Type:', Object.keys(serviceTypeBreakdown).map(type => ({
        type,
        count: serviceTypeBreakdown[type].length,
        sampleNames: serviceTypeBreakdown[type].slice(0, 2).map((s: Service) => s.name),
        samplePrices: serviceTypeBreakdown[type].slice(0, 2).map((s: Service) => s.price)
      })));
      console.log('Price Range:', priceRange);
    }    // Get services for selected types only
    const selectedTypeServices: Record<string, Service[]> = {};
    selectedTypes.forEach(type => {
      if (servicesByType[type]) {
        selectedTypeServices[type] = servicesByType[type].slice(0, 10); // Limit for performance
      }
    });

    // Generate combinations for 2 service types
    if (selectedTypes.length === 2) {
      const [type1, type2] = selectedTypes;
      const services1 = selectedTypeServices[type1] || [];
      const services2 = selectedTypeServices[type2] || [];

      const seenCombinations = new Set<string>();

      services1.forEach(service1 => {
        services2.forEach(service2 => {
          // Avoid combining the same service with itself
          if (service1.id === service2.id) return;

          const totalPrice = service1.price + service2.price;
          if (totalPrice >= priceRange[0] && totalPrice <= priceRange[1]) {
            // Create a consistent combination ID regardless of order
            const sortedIds = [service1.id, service2.id].sort();
            const combinationKey = sortedIds.join('-');

            if (!seenCombinations.has(combinationKey)) {
              seenCombinations.add(combinationKey);
              combinations.push({
                id: combinationKey,
                services: [service1, service2],
                totalPrice,
                types: [type1, type2]
              });
            }
          }
        });
      });
    }

    // Generate combinations for 3 service types
    if (selectedTypes.length === 3) {
      console.log('=== STARTING 3-SERVICE COMBINATIONS ===');
      const [type1, type2, type3] = selectedTypes;
      const services1 = selectedTypeServices[type1] || [];
      const services2 = selectedTypeServices[type2] || [];
      const services3 = selectedTypeServices[type3] || [];

      console.log('Available services:', {
        [type1]: services1.length,
        [type2]: services2.length,
        [type3]: services3.length
      });

      // Log sample services for each type
      console.log(`Sample ${type1} services:`, services1.slice(0, 2).map(s => ({ name: s.name, price: s.price })));
      console.log(`Sample ${type2} services:`, services2.slice(0, 2).map(s => ({ name: s.name, price: s.price })));
      console.log(`Sample ${type3} services:`, services3.slice(0, 2).map(s => ({ name: s.name, price: s.price })));

      if (services1.length === 0 || services2.length === 0 || services3.length === 0) {
        console.log('❌ Skipping 3-service combinations - missing services for one or more types');
        console.log('Missing types:', {
          [type1]: services1.length === 0,
          [type2]: services2.length === 0,
          [type3]: services3.length === 0
        });
      } else {
        const seenCombinations = new Set<string>();
        let combinationCount = 0;

        // Use fewer services to ensure we get results
        const maxServices = 3; // Reduce from 5 to 3 for better performance
        const limitedServices1 = services1.slice(0, maxServices);
        const limitedServices2 = services2.slice(0, maxServices);
        const limitedServices3 = services3.slice(0, maxServices);

        console.log('Processing combinations with limited services:', {
          [type1]: limitedServices1.length,
          [type2]: limitedServices2.length,
          [type3]: limitedServices3.length
        });

        // Generate all possible combinations
        for (let i = 0; i < limitedServices1.length; i++) {
          for (let j = 0; j < limitedServices2.length; j++) {
            for (let k = 0; k < limitedServices3.length; k++) {
              const service1 = limitedServices1[i];
              const service2 = limitedServices2[j];
              const service3 = limitedServices3[k];

              // Skip if same service appears multiple times
              if (service1.id === service2.id || service1.id === service3.id || service2.id === service3.id) {
                continue;
              }

              const totalPrice = service1.price + service2.price + service3.price;
              const withinBudget = totalPrice >= priceRange[0] && totalPrice <= priceRange[1];

              // Log ALL combinations for debugging
              console.log(`🔍 Combination ${combinationCount + 1}:`);
              console.log(`  ${service1.type}: ${service1.name} (₹${service1.price})`);
              console.log(`  ${service2.type}: ${service2.name} (₹${service2.price})`);
              console.log(`  ${service3.type}: ${service3.name} (₹${service3.price})`);
              console.log(`  Total: ₹${totalPrice}, Budget: ₹${priceRange[0]}-₹${priceRange[1]}, Within budget: ${withinBudget}`);

              if (withinBudget) {
                // Create unique combination key
                const sortedIds = [service1.id, service2.id, service3.id].sort();
                const combinationKey = sortedIds.join('-');

                if (!seenCombinations.has(combinationKey)) {
                  seenCombinations.add(combinationKey);
                  combinations.push({
                    id: combinationKey,
                    services: [service1, service2, service3],
                    totalPrice,
                    types: [type1, type2, type3]
                  });
                  combinationCount++;

                  console.log(`✅ ADDED 3-service combination #${combinationCount}:`);
                  console.log(`   Total Price: ₹${totalPrice}`);
                }
              } else {
                console.log(`❌ Combination rejected: Price ₹${totalPrice} not in budget ₹${priceRange[0]}-₹${priceRange[1]}`);
              }
            }
          }
        }

        console.log(`🎉 Total 3-service combinations created: ${combinationCount}`);
      }
    }

    // For more than 3 service types, create combinations of the first available services from each type
    if (selectedTypes.length > 3) {
      const seenCombinations = new Set<string>();

      // Get one service from each type for combinations
      const typesWithServices = selectedTypes.filter(type => selectedTypeServices[type] && selectedTypeServices[type].length > 0);

      if (typesWithServices.length >= 2) {
        // Create combinations using the first service from each type
        const firstServices = typesWithServices.map(type => selectedTypeServices[type][0]);

        // Create one large combination with all types
        const totalPrice = firstServices.reduce((sum, service) => sum + service.price, 0);

        if (totalPrice >= priceRange[0] && totalPrice <= priceRange[1]) {
          const sortedIds = firstServices.map(s => s.id).sort();
          const combinationKey = sortedIds.join('-');

          if (!seenCombinations.has(combinationKey)) {
            seenCombinations.add(combinationKey);
            combinations.push({
              id: combinationKey,
              services: firstServices,
              totalPrice,
              types: typesWithServices
            });
          }
        }
      }
    }

    // Sort by total price and return results
    const finalCombinations = combinations.sort((a, b) => a.totalPrice - b.totalPrice).slice(0, 20);

    console.log('=== FINAL COMBINATION RESULTS ===');
    console.log(`Selected types: ${selectedTypes.join(', ')}`);
    console.log(`Total combinations generated: ${finalCombinations.length}`);
    if (finalCombinations.length > 0) {
      console.log('Price range of combinations:', {
        lowest: `₹${finalCombinations[0].totalPrice}`,
        highest: `₹${finalCombinations[finalCombinations.length - 1].totalPrice}`,
        budget: `₹${priceRange[0]} - ₹${priceRange[1]}`
      });
    }

    return finalCombinations;
  }, [allServices, selectedTypes, priceRange, selectedCity, minRating, areaQuery, foodQuery]);

  // Get service type label
  const getServiceTypeLabel = (type: string) => {
    return serviceTypes.find(t => t.value === type)?.label || type.charAt(0).toUpperCase() + type.slice(1);
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
          <div className="space-y-6 p-4 bg-slate-50 rounded-xl animate-slide-up">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

              {/* Service Type Filter - Enhanced Multi-Select */}
              <div className="relative">
                <label className="block text-sm font-medium text-slate-700 mb-2">Service Type</label>
                <div className="relative">
                  <button
                    onClick={() => setServiceTypeDropdownOpen(!serviceTypeDropdownOpen)}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg text-left flex items-center justify-between hover:border-slate-300 focus:ring-2 focus:ring-slate-700 focus:border-slate-700"
                  >
                    <span className="text-slate-900">
                      {selectedTypes.length === 0 ? 'All Services' : `${selectedTypes.length} selected`}
                    </span>
                    <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${serviceTypeDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {serviceTypeDropdownOpen && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                      {serviceTypes.map(type => (
                        <label key={type.value} className="flex items-center px-4 py-3 hover:bg-slate-50 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedTypes.includes(type.value)}
                            onChange={() => toggleServiceType(type.value)}
                            className="w-4 h-4 text-slate-700 border-slate-300 rounded focus:ring-2 focus:ring-slate-700 focus:ring-offset-0"
                          />
                          <span className="ml-3 text-sm text-slate-700">{type.label}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                {/* Selected Service Types */}
                {selectedTypes.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedTypes.map(type => (
                      <span key={type} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-slate-700 text-white">
                        {serviceTypes.find(t => t.value === type)?.label}
                        <button
                          onClick={() => removeServiceType(type)}
                          className="ml-2 hover:bg-slate-600 rounded-full p-0.5"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* City Filter */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">City</label>
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-700 focus:border-slate-700 bg-white text-slate-900"
                >
                  <option value="">All Cities</option>
                  {cities.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
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
                  className="w-full slider"
                />
              </div>
            </div>

            {/* Enhanced Price Range */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Budget: ₹{priceRange[0].toLocaleString()} - ₹{priceRange[1].toLocaleString()} per month
              </label>
              <div className="relative px-2">
                {/* Dual Range Slider Container */}
                <div className="relative h-6">
                  {/* Track Background */}
                  <div className="absolute top-1/2 transform -translate-y-1/2 w-full h-1 bg-slate-200 rounded"></div>

                  {/* Active Range */}
                  <div
                    className="absolute top-1/2 transform -translate-y-1/2 h-1 bg-slate-700 rounded"
                    style={{
                      left: `${(priceRange[0] / 100000) * 100}%`,
                      width: `${((priceRange[1] - priceRange[0]) / 100000) * 100}%`
                    }}
                  ></div>

                  {/* Min Range Input */}
                  <input
                    type="range"
                    min={0}
                    max={100000}
                    step={1000}
                    value={priceRange[0]}
                    onChange={(e) => {
                      const value = Number(e.target.value);
                      if (value <= priceRange[1]) {
                        setPriceRange([value, priceRange[1]]);
                      }
                    }}
                    className="absolute w-full h-6 bg-transparent cursor-pointer dual-range"
                  />

                  {/* Max Range Input */}
                  <input
                    type="range"
                    min={0}
                    max={100000}
                    step={1000}
                    value={priceRange[1]}
                    onChange={(e) => {
                      const value = Number(e.target.value);
                      if (value >= priceRange[0]) {
                        setPriceRange([priceRange[0], value]);
                      }
                    }}
                    className="absolute w-full h-6 bg-transparent cursor-pointer dual-range"
                  />
                </div>

                {/* Labels */}
                <div className="flex justify-between text-xs text-slate-500 mt-2 px-1">
                  <span>₹0</span>
                  <span>₹1,00,000</span>
                </div>
              </div>
            </div>

            {/* Conditional Area Filter */}
            {selectedTypes.includes('accommodation') && (
              <div className="relative">
                <label className="block text-sm font-medium text-slate-700 mb-2">Area Name</label>
                <input
                  type="text"
                  placeholder="Type area name (e.g., Vaishno, Bodakdev)..."
                  value={areaQuery}
                  onChange={(e) => {
                    setAreaQuery(e.target.value);
                    setShowAreaSuggestions(e.target.value.length > 0);
                  }}
                  onFocus={() => setShowAreaSuggestions(areaQuery.length > 0)}
                  onBlur={() => setTimeout(() => setShowAreaSuggestions(false), 300)}
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-700 focus:border-slate-700 text-slate-900 placeholder-slate-500"
                />

                {showAreaSuggestions && filteredAreaSuggestions.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                    {filteredAreaSuggestions.slice(0, 8).map(area => (
                      <button
                        key={area}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          setAreaQuery(area);
                          setShowAreaSuggestions(false);
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-slate-50 text-sm text-slate-700"
                      >
                        {area}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Conditional Food Filter */}
            {(selectedTypes.includes('food') || selectedTypes.includes('tiffin')) && (
              <div className="relative">
                <label className="block text-sm font-medium text-slate-700 mb-2">Food Type</label>
                <input
                  type="text"
                  placeholder="Type food type (e.g., Gujarati, South Indian)..."
                  value={foodQuery}
                  onChange={(e) => {
                    setFoodQuery(e.target.value);
                    setShowFoodSuggestions(e.target.value.length > 0);
                  }}
                  onFocus={() => setShowFoodSuggestions(foodQuery.length > 0)}
                  onBlur={() => setTimeout(() => setShowFoodSuggestions(false), 300)}
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-700 focus:border-slate-700 text-slate-900 placeholder-slate-500"
                />

                {showFoodSuggestions && filteredFoodSuggestions.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                    {filteredFoodSuggestions.slice(0, 8).map(food => (
                      <button
                        key={food}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          setFoodQuery(food);
                          setShowFoodSuggestions(false);
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-slate-50 text-sm text-slate-700"
                      >
                        {food}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
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
        <div className="space-y-6">
          {/* Tab Navigation - show only when we have combinations */}
          {selectedTypes.length > 1 && serviceCombinations.length > 0 && (
            <div className="border-b border-slate-200">
              <div className="flex space-x-8">
                <button
                  onClick={() => setActiveView('combined')}
                  className={`py-3 px-1 border-b-2 font-medium text-sm ${activeView === 'combined'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                    }`}
                >
                  Combined Services
                  <span className="ml-2 bg-blue-100 text-blue-600 text-xs px-2 py-1 rounded-full">
                    {serviceCombinations.length}
                  </span>
                </button>
                <button
                  onClick={() => setActiveView('individual')}
                  className={`py-3 px-1 border-b-2 font-medium text-sm ${activeView === 'individual'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                    }`}
                >
                  Individual Services
                  <span className="ml-2 bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded-full">
                    {filteredServices.length}
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* Combined Services Tab Content */}
          {selectedTypes.length > 1 && serviceCombinations.length > 0 && activeView === 'combined' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-slate-900">
                  Combined Services Within Budget
                </h2>
                <span className="text-sm text-slate-600">
                  {serviceCombinations.length} combinations found
                </span>
              </div>

              <div className="grid gap-4">
                {serviceCombinations.map((combination) => (
                  <ServiceCombinationCard
                    key={combination.id}
                    combination={combination}
                    onViewDetails={setSelectedService}
                    onToggleBookmark={toggleBookmark}
                    isBookmarked={(serviceId: string) => bookmarkedIds.has(serviceId)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Individual Services Tab Content */}
          {(activeView === 'individual' || selectedTypes.length <= 1 || serviceCombinations.length === 0) && (
            <div>
              {selectedTypes.length > 1 && serviceCombinations.length > 0 && (
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-slate-900">Individual Services</h2>
                  <span className="text-sm text-slate-600">
                    {filteredServices.length} services found
                  </span>
                </div>
              )}

              {/* Individual services */}
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
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredServices.length === 0 && serviceCombinations.length === 0 && (
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
              setAreaQuery('');
              setFoodQuery('');
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

export default ServiceSearch;

