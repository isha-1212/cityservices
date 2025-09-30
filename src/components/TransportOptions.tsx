import React, { useState, useEffect } from 'react';
import { MapPin, Clock, DollarSign, Car, Navigation, ExternalLink } from 'lucide-react';
import { getUberPriceEstimates, cityCoordinates, areaCoordinates } from '../utils/uberApi';
import { getOlaPriceEstimates } from '../utils/olaApi';

interface TransportOption {
  id: string;
  name: string;
  estimatedTime: string;
  priceRange: string;
  basePrice: number;
  pricePerKm: number;
  image: string;
  duration: number;
  distance: number;
  provider: 'uber' | 'ola';
}

interface TransportOptionsProps {
  sourceCity: string;
  sourceArea?: string;
  destinationCity: string;
  destinationArea?: string;
  onSelectOption: (option: TransportOption) => void;
}

// Mock transport options (will be replaced with API integration)
const mockTransportOptions: TransportOption[] = [
  // Uber options
  {
    id: 'uber-go',
    name: 'Uber Go',
    estimatedTime: '25-35 min',
    priceRange: '₹450-650',
    basePrice: 450,
    pricePerKm: 8,
    image: '🚗',
    duration: 25,
    distance: 110,
    provider: 'uber'
  },
  {
    id: 'uber-premier',
    name: 'Uber Premier',
    estimatedTime: '30-40 min',
    priceRange: '₹650-850',
    basePrice: 650,
    pricePerKm: 10,
    image: '🚙',
    duration: 30,
    distance: 110,
    provider: 'uber'
  },
  {
    id: 'uber-xl',
    name: 'Uber XL',
    estimatedTime: '35-45 min',
    priceRange: '₹850-1200',
    basePrice: 850,
    pricePerKm: 12,
    image: '🚐',
    duration: 35,
    distance: 110,
    provider: 'uber'
  },
  {
    id: 'uber-auto',
    name: 'Uber Auto',
    estimatedTime: '20-30 min',
    priceRange: '₹350-550',
    basePrice: 350,
    pricePerKm: 6,
    image: '🛺',
    duration: 20,
    distance: 110,
    provider: 'uber'
  },
  // Ola options
  {
    id: 'ola-micro',
    name: 'Ola Micro',
    estimatedTime: '22-32 min',
    priceRange: '₹420-620',
    basePrice: 420,
    pricePerKm: 7,
    image: '🚗',
    duration: 22,
    distance: 110,
    provider: 'ola'
  },
  {
    id: 'ola-mini',
    name: 'Ola Mini',
    estimatedTime: '28-38 min',
    priceRange: '₹580-780',
    basePrice: 580,
    pricePerKm: 9,
    image: '🚙',
    duration: 28,
    distance: 110,
    provider: 'ola'
  },
  {
    id: 'ola-prime',
    name: 'Ola Prime',
    estimatedTime: '32-42 min',
    priceRange: '₹780-1080',
    basePrice: 780,
    pricePerKm: 12,
    image: '🚐',
    duration: 32,
    distance: 110,
    provider: 'ola'
  },
  {
    id: 'ola-auto',
    name: 'Ola Auto',
    estimatedTime: '18-28 min',
    priceRange: '₹320-520',
    basePrice: 320,
    pricePerKm: 6,
    image: '🛺',
    duration: 18,
    distance: 110,
    provider: 'ola'
  }
];

export const TransportOptions: React.FC<TransportOptionsProps> = ({
  sourceCity,
  sourceArea,
  destinationCity,
  destinationArea,
  onSelectOption
}) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [estimatedDistance, setEstimatedDistance] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [transportOptions, setTransportOptions] = useState<TransportOption[]>([]);

  // Fetch transport options using Uber API
  useEffect(() => {
    const fetchTransportOptions = async () => {
      if (!sourceCity || !destinationCity) return;

      setLoading(true);

      try {
        // Get coordinates for source and destination (cities or areas)
        // Use case-insensitive matching
        const sourceCityKey = Object.keys(cityCoordinates).find(key =>
          key.toLowerCase() === sourceCity.toLowerCase()
        );
        const destCityKey = Object.keys(cityCoordinates).find(key =>
          key.toLowerCase() === destinationCity.toLowerCase()
        );

        let sourceCoords = sourceCityKey ? cityCoordinates[sourceCityKey] : null;
        let destCoords = destCityKey ? cityCoordinates[destCityKey] : null;

        // If areas are specified, use area coordinates instead of city coordinates
        if (sourceArea && sourceCityKey && areaCoordinates[sourceCityKey]?.[sourceArea]) {
          sourceCoords = areaCoordinates[sourceCityKey][sourceArea];
        }
        if (destinationArea && destCityKey && areaCoordinates[destCityKey]?.[destinationArea]) {
          destCoords = areaCoordinates[destCityKey][destinationArea];
        }

        if (!sourceCoords || !destCoords) {
          // Fallback to mock data when coordinates are not available
          setTransportOptions(mockTransportOptions);
          setEstimatedDistance('Distance unavailable - using estimates');
          setLoading(false);
          return;
        }

        // Fetch both Uber and Ola price estimates
        const [uberEstimates, olaResponse] = await Promise.all([
          getUberPriceEstimates(
            sourceCoords.latitude,
            sourceCoords.longitude,
            destCoords.latitude,
            destCoords.longitude
          ),
          getOlaPriceEstimates(
            sourceCoords.latitude,
            sourceCoords.longitude,
            destCoords.latitude,
            destCoords.longitude
          )
        ]);

        // Convert Uber API response to our TransportOption format
        const uberOptions: TransportOption[] = uberEstimates.map(estimate => {
          const distance = estimate.distance;
          const duration = estimate.duration;

          // Calculate realistic time range based on distance and traffic
          const baseTime = Math.round(duration / 60);
          const trafficBuffer = Math.max(5, Math.round(distance * 0.3)); // 30% buffer for traffic
          const minTime = baseTime;
          const maxTime = baseTime + trafficBuffer;

          return {
            id: estimate.product_id,
            name: estimate.display_name,
            estimatedTime: `${minTime}-${maxTime} min`,
            priceRange: estimate.estimate,
            basePrice: estimate.low_estimate,
            pricePerKm: Math.round(estimate.low_estimate / distance),
            image: getTransportIcon(estimate.product_id, 'uber'),
            duration: duration,
            distance: distance,
            provider: 'uber' as const
          };
        });

        // Convert Ola API response to our TransportOption format
        const olaOptions: TransportOption[] = olaResponse.ride_estimate.map(estimate => {
          const distance = estimate.distance;
          const duration = estimate.travel_time_in_minutes;

          // Calculate realistic time range based on distance and traffic
          const baseTime = Math.round(duration / 60);
          const trafficBuffer = Math.max(5, Math.round(distance * 0.3)); // 30% buffer for traffic
          const minTime = baseTime;
          const maxTime = baseTime + trafficBuffer;

          return {
            id: `ola-${estimate.category}`,
            name: olaResponse.categories.find(cat => cat.id === estimate.category)?.display_name || estimate.category,
            estimatedTime: `${minTime}-${maxTime} min`,
            priceRange: `₹${estimate.amount_min}-${estimate.amount_max}`,
            basePrice: estimate.amount_min,
            pricePerKm: Math.round(estimate.amount_min / distance),
            image: getTransportIcon(estimate.category, 'ola'),
            duration: duration * 60, // Convert to seconds for consistency
            distance: distance,
            provider: 'ola' as const
          };
        });

        // Combine both Uber and Ola options
        const options = [...uberOptions, ...olaOptions];

        setTransportOptions(options);
        setEstimatedDistance(`${Math.round(uberEstimates[0]?.distance || olaResponse.ride_estimate[0]?.distance || 0)} km`);

      } catch (error) {
        console.error('Error fetching transport options:', error);
        // Fallback to mock data
        setTransportOptions(mockTransportOptions);
        setEstimatedDistance('Distance unavailable');
      }

      setLoading(false);
    };

    fetchTransportOptions();
  }, [sourceCity, destinationCity]);

  // Helper function to get transport icons
  const getTransportIcon = (productId: string, provider?: 'uber' | 'ola'): string => {
    const uberIcons: Record<string, string> = {
      'uber-go': '🚗',
      'uber-premier': '🚙',
      'uber-xl': '🚐',
      'uber-auto': '🛺'
    };

    const olaIcons: Record<string, string> = {
      'micro': '🚗',
      'mini': '🚙',
      'prime': '🚐',
      'auto': '🛺'
    };

    if (provider === 'ola') {
      return olaIcons[productId] || '🚗';
    }

    return uberIcons[productId] || '🚗';
  };

  const handleOptionSelect = (option: TransportOption) => {
    setSelectedOption(option.id);
    onSelectOption(option);
  };

  const handleViewOnProvider = (option: TransportOption) => {
    let url = '';

    if (option.provider === 'uber') {
      // For demo purposes, redirect to Uber's main website
      // In production, you would use Uber's deep linking API with actual coordinates
      url = `https://www.uber.com/in/en/ride/`;
    } else if (option.provider === 'ola') {
      // For demo purposes, redirect to Ola's main website
      // In production, you would use Ola's deep linking API with actual coordinates
      url = `https://www.olacabs.com/`;
    }

    window.open(url, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Route Information */}
      <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl p-6 border border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-slate-900">Transport Options</h3>
          <div className="flex items-center text-sm text-slate-600">
            <MapPin className="w-4 h-4 mr-1" />
            <span>{estimatedDistance}</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-slate-700 text-white px-3 py-1 rounded-full text-sm font-medium">
              {sourceArea ? `${sourceCity} - ${sourceArea}` : sourceCity}
            </div>
            <Navigation className="w-5 h-5 text-slate-400" />
            <div className="bg-slate-700 text-white px-3 py-1 rounded-full text-sm font-medium">
              {destinationArea ? `${destinationCity} - ${destinationArea}` : destinationCity}
            </div>
          </div>

          {loading && (
            <div className="flex items-center text-slate-600">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-slate-700 mr-2"></div>
              Calculating...
            </div>
          )}
        </div>
      </div>

      {/* Transport Options Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {transportOptions.map((option) => (
          <div
            key={option.id}
            className={`p-6 rounded-xl border-2 cursor-pointer transition-all duration-200 ${selectedOption === option.id
                ? 'border-slate-700 bg-slate-50 shadow-lg'
                : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 hover:shadow-md'
              }`}
            onClick={() => handleOptionSelect(option)}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="text-3xl">{option.image}</div>
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <h4 className="font-semibold text-slate-900">{option.name}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${option.provider === 'uber'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-green-100 text-green-800'
                      }`}>
                      {option.provider === 'uber' ? 'Uber' : 'Ola'}
                    </span>
                  </div>
                  <div className="flex items-center text-sm text-slate-600">
                    <Clock className="w-4 h-4 mr-1" />
                    <span>{option.estimatedTime}</span>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="text-lg font-bold text-slate-900">{option.priceRange}</div>
                <div className="text-xs text-slate-500">estimated</div>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm text-slate-600 mb-3">
              <div className="flex items-center">
                <DollarSign className="w-4 h-4 mr-1" />
                <span>Base: ₹{option.basePrice}</span>
              </div>
              <div className="flex items-center">
                <Car className="w-4 h-4 mr-1" />
                <span>₹{option.pricePerKm}/km</span>
              </div>
            </div>

            {/* View on Provider button for all options */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleViewOnProvider(option);
              }}
              className={`w-full py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 ${option.provider === 'uber'
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-green-600 text-white hover:bg-green-700'
                }`}
            >
              <ExternalLink className="w-4 h-4" />
              <span>View on {option.provider === 'uber' ? 'Uber' : 'Ola'}</span>
            </button>

            {selectedOption === option.id && (
              <div className="mt-3 p-2 bg-slate-700 text-white rounded-lg text-center font-medium text-sm">
                ✓ Selected - Ready to Book
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Additional Information */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-start space-x-3">
          <div className="text-blue-600">ℹ️</div>
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Pricing Information</p>
            <p>Prices are estimates and may vary based on demand, traffic, and route conditions.
              Final fare will be calculated at the time of booking.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
