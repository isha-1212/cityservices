import React, { useState } from 'react';
import { X, MapPin, Search } from 'lucide-react';
import { TransportOptions } from './TransportOptions';

interface TransportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTransport: (transport: any) => void;
}

const availableCities = [
  'Ahmedabad', 'Baroda', 'Gandhinagar', 'Rajkot', 'Surat'
];

const cityAreas: Record<string, string[]> = {
  'Ahmedabad': [
    'Vaishno Devi Circle', 'Shantigram', 'Jagatpur', 'Bodakdev', 'Motera', 'Bopal',
    'Chandkheda', 'Shela', 'Chharodi', 'Sanand', 'Shilaj', 'Tragad', 'Vastrapur',
    'Ambli', 'Paldi', 'Satellite', 'Ghuma', 'Ellisbridge', 'Gota', 'Navrangpura',
    'Sola', 'Jodhpur', 'Makarba', 'Vastral', 'New Maninagar', 'Mahadev Nagar',
    'Odhav', 'Ramol', 'Vejalpur', 'Vijay Nagar', 'Vavol', 'Maninagar', 'Naroda',
    'Narol', 'Asarwa', 'Sabarmati', 'Naranpura', 'Usmanpura', 'C.G. Road',
    'Drive-In Road', 'Thaltej', 'Bodakdev', 'Prahladnagar', 'S.G. Highway'
  ],
  'Baroda': [
    'Alkapuri', 'Sayajigunj', 'Fatehgunj', 'Rajmahal Road', 'Akshar Chowk',
    'Old Padra Road', 'New Padra Road', 'Gotri', 'Makarpura', 'Subhanpura',
    'Karelibaug', 'Vadodara Railway Station', 'Manjalpur', 'Tandalja',
    'Harni', 'Vasna', 'Akota', 'Sama', 'Vadodara Central', 'Race Course',
    'Navlakhi Compound', 'Raopura', 'Mandvi', 'Wadi', 'Kala Ghoda',
    'Bhayli', 'Dumad', 'Karelibaug', 'Tarsali', 'Makarpura'
  ],
  'Gandhinagar': [
    'Sector 1', 'Sector 2', 'Sector 3', 'Sector 4', 'Sector 5', 'Sector 6',
    'Sector 7', 'Sector 8', 'Sector 9', 'Sector 10', 'Sector 11', 'Sector 12',
    'Sector 13', 'Sector 14', 'Sector 15', 'Sector 16', 'Sector 17', 'Sector 18',
    'Sector 19', 'Sector 20', 'Sector 21', 'Sector 22', 'Sector 23', 'Sector 24',
    'Sector 25', 'Sector 26', 'Sector 27', 'Sector 28', 'Sector 29', 'Sector 30',
    'Infocity', 'GIFT City', 'Capital Complex', 'Pragatinagar'
  ],
  'Rajkot': [
    'Kalavad Road', '150 Feet Ring Road', 'University Road', 'Gondal Road',
    'Bhavsar Para', 'Jagnath Plot', 'Gujarat College Road', 'Mavdi Road',
    'Shastri Nagar', 'Kalawad Road', 'Dhebar Road', 'Paldi', 'Sadar',
    'Raiya Road', 'Bedipara', 'Trikonbaug', 'Limbdi Chowk', 'Lakhajiraj Road',
    'Dhebarbhai Road', 'Nana Mava Road', 'Kotharia Road', 'Morbi Road',
    'Jamnagar Road', 'Bhakti Nagar', 'Vidhyanagar', 'Sanand Road'
  ],
  'Surat': [
    'Adajan', 'Athwa', 'Begumpura', 'City Light', 'Dumas', 'Ghod Dod Road',
    'Katargam', 'Limbayat', 'Magdalla', 'Pal', 'Piplod', 'Rander',
    'Sachin', 'Salabatpura', 'Sarthana', 'Udhna', 'Varachha', 'Vesu',
    'Athwalines', 'Bhatar', 'Chowk Bazar', 'Dindoli', 'Gopipura',
    'Hajira', 'Ichchhapor', 'Jakatnaka', 'Karanj', 'Katodara', 'Lal Darwaja',
    'Mota Varachha', 'Nana Varachha', 'Pandesara', 'Parvat Patiya',
    'Sachin GIDC', 'Sagrampura', 'Sahajanand', 'Salabatpura', 'Sayan',
    'Timaliyawad', 'Umarwada', 'Wadifaliya', 'Zampa Bazar'
  ]
};

export const TransportModal: React.FC<TransportModalProps> = ({
  isOpen,
  onClose,
  onSelectTransport
}) => {
  const [sourceCity, setSourceCity] = useState('');
  const [sourceArea, setSourceArea] = useState('');
  const [destinationCity, setDestinationCity] = useState('');
  const [destinationArea, setDestinationArea] = useState('');
  const [showTransportOptions, setShowTransportOptions] = useState(false);
  const [sourceSuggestions, setSourceSuggestions] = useState<string[]>([]);
  const [destSuggestions, setDestSuggestions] = useState<string[]>([]);
  const [sourceAreaSuggestions, setSourceAreaSuggestions] = useState<string[]>([]);
  const [destAreaSuggestions, setDestAreaSuggestions] = useState<string[]>([]);
  const [showSourceSuggestions, setShowSourceSuggestions] = useState(false);
  const [showDestSuggestions, setShowDestSuggestions] = useState(false);
  const [showSourceAreaSuggestions, setShowSourceAreaSuggestions] = useState(false);
  const [showDestAreaSuggestions, setShowDestAreaSuggestions] = useState(false);

  const handleSourceCityChange = (value: string) => {
    setSourceCity(value);
    setSourceArea(''); // Reset area when city changes
    if (value.length > 0) {
      const filtered = availableCities.filter(city => 
        city.toLowerCase().includes(value.toLowerCase()) && city !== destinationCity
      );
      setSourceSuggestions(filtered);
      setShowSourceSuggestions(true);
    } else {
      setShowSourceSuggestions(false);
    }
  };

  const handleSourceAreaChange = (value: string) => {
    setSourceArea(value);
    if (value.length > 0 && sourceCity) {
      const areas = cityAreas[sourceCity] || [];
      const filtered = areas.filter(area => 
        area.toLowerCase().includes(value.toLowerCase())
      );
      setSourceAreaSuggestions(filtered);
      setShowSourceAreaSuggestions(true);
    } else {
      setShowSourceAreaSuggestions(false);
    }
  };

  const handleDestinationCityChange = (value: string) => {
    setDestinationCity(value);
    setDestinationArea(''); // Reset area when city changes
    if (value.length > 0) {
      const filtered = availableCities.filter(city => 
        city.toLowerCase().includes(value.toLowerCase()) && city !== sourceCity
      );
      setDestSuggestions(filtered);
      setShowDestSuggestions(true);
    } else {
      setShowDestSuggestions(false);
    }
  };

  const handleDestinationAreaChange = (value: string) => {
    setDestinationArea(value);
    if (value.length > 0 && destinationCity) {
      const areas = cityAreas[destinationCity] || [];
      const filtered = areas.filter(area => 
        area.toLowerCase().includes(value.toLowerCase())
      );
      setDestAreaSuggestions(filtered);
      setShowDestAreaSuggestions(true);
    } else {
      setShowDestAreaSuggestions(false);
    }
  };

  const selectSourceCity = (city: string) => {
    setSourceCity(city);
    setSourceArea('');
    setShowSourceSuggestions(false);
  };

  const selectSourceArea = (area: string) => {
    setSourceArea(area);
    setShowSourceAreaSuggestions(false);
  };

  const selectDestinationCity = (city: string) => {
    setDestinationCity(city);
    setDestinationArea('');
    setShowDestSuggestions(false);
  };

  const selectDestinationArea = (area: string) => {
    setDestinationArea(area);
    setShowDestAreaSuggestions(false);
  };

  const handleSearch = () => {
    // Allow search if both cities are selected, or if same city with different areas
    if (sourceCity && destinationCity) {
      if (sourceCity === destinationCity) {
        // Same city - need different areas
        if (sourceArea && destinationArea && sourceArea !== destinationArea) {
          setShowTransportOptions(true);
        }
      } else {
        // Different cities - areas are optional
        setShowTransportOptions(true);
      }
    }
  };

  const handleTransportSelect = (transport: any) => {
    const sourceLocation = sourceArea ? `${sourceCity} - ${sourceArea}` : sourceCity;
    const destLocation = destinationArea ? `${destinationCity} - ${destinationArea}` : destinationCity;
    
    const transportService = {
      id: `transport-${sourceCity}-${sourceArea || 'city'}-${destinationCity}-${destinationArea || 'city'}-${transport.id}`,
      name: `${transport.name} - ${sourceLocation} to ${destLocation}`,
      type: 'transport',
      city: sourceCity,
      area: destinationCity,
      price: transport.basePrice,
      priceRange: transport.priceRange,
      estimatedTime: transport.estimatedTime,
      image: transport.image,
      description: `${transport.name} service from ${sourceLocation} to ${destLocation}`,
      facilities: ['Estimated time', 'Price range', 'Base fare included'],
      rating: 4.5,
      reviews: 120,
      sourceLocation: sourceLocation,
      destinationLocation: destLocation
    };
    
    onSelectTransport(transportService);
    onClose();
  };

  const resetModal = () => {
    setSourceCity('');
    setSourceArea('');
    setDestinationCity('');
    setDestinationArea('');
    setShowTransportOptions(false);
    setShowSourceSuggestions(false);
    setShowDestSuggestions(false);
    setShowSourceAreaSuggestions(false);
    setShowDestAreaSuggestions(false);
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-2xl font-bold text-slate-900">Find Transport Options</h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-slate-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {!showTransportOptions ? (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MapPin className="w-8 h-8 text-slate-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  Select Your Route
                </h3>
                <p className="text-slate-600">
                  Choose your source and destination cities to find transport options
                </p>
              </div>

              {/* Source City Input */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">
                  From (Source City)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={sourceCity}
                    onChange={(e) => handleSourceCityChange(e.target.value)}
                    placeholder="Enter source city..."
                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-700 focus:border-slate-700 text-slate-900"
                  />
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                  
                  {showSourceSuggestions && sourceSuggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-10 max-h-48 overflow-y-auto">
                      {sourceSuggestions.map((city, index) => (
                        <button
                          key={index}
                          onClick={() => selectSourceCity(city)}
                          className="w-full px-4 py-2 text-left hover:bg-slate-50 first:rounded-t-xl last:rounded-b-xl"
                        >
                          {city}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Source Area Input */}
              {sourceCity && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">
                    From Area (Optional)
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={sourceArea}
                      onChange={(e) => handleSourceAreaChange(e.target.value)}
                      placeholder="Enter source area..."
                      className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-700 focus:border-slate-700 text-slate-900"
                    />
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                    
                    {showSourceAreaSuggestions && sourceAreaSuggestions.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-10 max-h-48 overflow-y-auto">
                        {sourceAreaSuggestions.map((area, index) => (
                          <button
                            key={index}
                            onClick={() => selectSourceArea(area)}
                            className="w-full px-4 py-2 text-left hover:bg-slate-50 first:rounded-t-xl last:rounded-b-xl"
                          >
                            {area}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Destination City Input */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">
                  To (Destination City)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={destinationCity}
                    onChange={(e) => handleDestinationCityChange(e.target.value)}
                    placeholder="Enter destination city..."
                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-700 focus:border-slate-700 text-slate-900"
                  />
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                  
                  {showDestSuggestions && destSuggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-10 max-h-48 overflow-y-auto">
                      {destSuggestions.map((city, index) => (
                        <button
                          key={index}
                          onClick={() => selectDestinationCity(city)}
                          className="w-full px-4 py-2 text-left hover:bg-slate-50 first:rounded-t-xl last:rounded-b-xl"
                        >
                          {city}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Destination Area Input */}
              {destinationCity && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">
                    To Area (Optional)
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={destinationArea}
                      onChange={(e) => handleDestinationAreaChange(e.target.value)}
                      placeholder="Enter destination area..."
                      className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-700 focus:border-slate-700 text-slate-900"
                    />
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                    
                    {showDestAreaSuggestions && destAreaSuggestions.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-10 max-h-48 overflow-y-auto">
                        {destAreaSuggestions.map((area, index) => (
                          <button
                            key={index}
                            onClick={() => selectDestinationArea(area)}
                            className="w-full px-4 py-2 text-left hover:bg-slate-50 first:rounded-t-xl last:rounded-b-xl"
                          >
                            {area}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Search Button */}
              <div className="pt-4">
                <button
                  onClick={handleSearch}
                  disabled={
                    !sourceCity || !destinationCity || 
                    (sourceCity === destinationCity && (!sourceArea || !destinationArea || sourceArea === destinationArea))
                  }
                  className="w-full bg-slate-700 text-white py-3 px-6 rounded-xl font-medium hover:bg-slate-800 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
                >
                  <Search className="w-5 h-5" />
                  <span>Find Transport Options</span>
                </button>
                
                {sourceCity && destinationCity && sourceCity === destinationCity && (!sourceArea || !destinationArea || sourceArea === destinationArea) && (
                  <p className="text-red-500 text-sm mt-2 text-center">
                    For same city travel, please select different areas
                  </p>
                )}
              </div>
            </div>
          ) : (
            <TransportOptions
              sourceCity={sourceCity}
              sourceArea={sourceArea}
              destinationCity={destinationCity}
              destinationArea={destinationArea}
              onSelectOption={handleTransportSelect}
            />
          )}
        </div>
      </div>
    </div>
  );
};
