// Uber API integration utilities
// Note: This is a simplified implementation for demonstration
// In production, you would need to implement proper authentication and error handling

export interface UberPriceEstimate {
  product_id: string;
  currency_code: string;
  display_name: string;
  estimate: string;
  low_estimate: number;
  high_estimate: number;
  surge_multiplier: number;
  duration: number;
  distance: number;
}

export interface UberTimeEstimate {
  product_id: string;
  display_name: string;
  estimate: number;
}

// Mock API responses for demonstration
// In production, replace with actual Uber API calls
export const getUberPriceEstimates = async (
  startLatitude: number,
  startLongitude: number,
  endLatitude: number,
  endLongitude: number
): Promise<UberPriceEstimate[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Mock response based on distance calculation
  const distance = calculateDistance(startLatitude, startLongitude, endLatitude, endLongitude);
  
  return [
    {
      product_id: 'uber-go',
      currency_code: 'INR',
      display_name: 'Uber Go',
      estimate: `₹${Math.round(45 + distance * 8)}-${Math.round(65 + distance * 8)}`,
      low_estimate: Math.round(45 + distance * 8),
      high_estimate: Math.round(65 + distance * 8),
      surge_multiplier: 1.0,
      duration: Math.round(distance * 1.5 + 10), // More realistic: 1.5 min per km + 10 min base
      distance: distance
    },
    {
      product_id: 'uber-premier',
      currency_code: 'INR',
      display_name: 'Uber Premier',
      estimate: `₹${Math.round(65 + distance * 10)}-${Math.round(85 + distance * 10)}`,
      low_estimate: Math.round(65 + distance * 10),
      high_estimate: Math.round(85 + distance * 10),
      surge_multiplier: 1.0,
      duration: Math.round(distance * 1.4 + 15), // Slightly faster than Go
      distance: distance
    },
    {
      product_id: 'uber-xl',
      currency_code: 'INR',
      display_name: 'Uber XL',
      estimate: `₹${Math.round(85 + distance * 12)}-${Math.round(120 + distance * 12)}`,
      low_estimate: Math.round(85 + distance * 12),
      high_estimate: Math.round(120 + distance * 12),
      surge_multiplier: 1.0,
      duration: Math.round(distance * 1.6 + 20), // Slightly slower due to size
      distance: distance
    },
    {
      product_id: 'uber-auto',
      currency_code: 'INR',
      display_name: 'Uber Auto',
      estimate: `₹${Math.round(35 + distance * 6)}-${Math.round(55 + distance * 6)}`,
      low_estimate: Math.round(35 + distance * 6),
      high_estimate: Math.round(55 + distance * 6),
      surge_multiplier: 1.0,
      duration: Math.round(distance * 1.3 + 5), // Faster for short distances
      distance: distance
    }
  ];
};

export const getUberTimeEstimates = async (
  _startLatitude: number,
  _startLongitude: number
): Promise<UberTimeEstimate[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));

  return [
    {
      product_id: 'uber-go',
      display_name: 'Uber Go',
      estimate: Math.round(5 + Math.random() * 10)
    },
    {
      product_id: 'uber-premier',
      display_name: 'Uber Premier',
      estimate: Math.round(8 + Math.random() * 12)
    },
    {
      product_id: 'uber-xl',
      display_name: 'Uber XL',
      estimate: Math.round(10 + Math.random() * 15)
    },
    {
      product_id: 'uber-auto',
      display_name: 'Uber Auto',
      estimate: Math.round(3 + Math.random() * 8)
    }
  ];
};

// Helper function to calculate distance between two coordinates (Haversine formula)
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  return distance;
};

// Gujarat cities and areas coordinates mapping
export const cityCoordinates: Record<string, { latitude: number; longitude: number }> = {
  'Ahmedabad': { latitude: 23.0225, longitude: 72.5714 },
  'Baroda': { latitude: 22.3072, longitude: 73.1812 },
  'Gandhinagar': { latitude: 23.2156, longitude: 72.6369 },
  'Rajkot': { latitude: 22.3039, longitude: 70.8022 },
  'Surat': { latitude: 21.1702, longitude: 72.8311 }
};

// Area coordinates within cities (approximate)
export const areaCoordinates: Record<string, Record<string, { latitude: number; longitude: number }>> = {
  'Ahmedabad': {
    'Vaishno Devi Circle': { latitude: 23.0225, longitude: 72.5714 },
    'Shantigram': { latitude: 23.0456, longitude: 72.5923 },
    'Jagatpur': { latitude: 23.0156, longitude: 72.5523 },
    'Bodakdev': { latitude: 23.0356, longitude: 72.5623 },
    'Motera': { latitude: 23.0856, longitude: 72.5823 },
    'Bopal': { latitude: 23.0656, longitude: 72.5423 },
    'Chandkheda': { latitude: 23.0756, longitude: 72.5323 },
    'Shela': { latitude: 23.0456, longitude: 72.5123 },
    'Chharodi': { latitude: 23.0256, longitude: 72.4923 },
    'Sanand': { latitude: 22.9856, longitude: 72.4723 },
    'Shilaj': { latitude: 23.0556, longitude: 72.5223 },
    'Tragad': { latitude: 23.0656, longitude: 72.5123 },
    'Vastrapur': { latitude: 23.0456, longitude: 72.5423 },
    'Ambli': { latitude: 23.0356, longitude: 72.5323 },
    'Paldi': { latitude: 23.0256, longitude: 72.5523 },
    'Satellite': { latitude: 23.0156, longitude: 72.5623 },
    'Ghuma': { latitude: 23.0656, longitude: 72.5723 },
    'Ellisbridge': { latitude: 23.0456, longitude: 72.5823 },
    'Gota': { latitude: 23.0756, longitude: 72.5923 },
    'Navrangpura': { latitude: 23.0556, longitude: 72.5923 },
    'Sola': { latitude: 23.0856, longitude: 72.5723 },
    'Jodhpur': { latitude: 23.0756, longitude: 72.5623 },
    'Makarba': { latitude: 23.0656, longitude: 72.5523 },
    'Vastral': { latitude: 23.0556, longitude: 72.5623 },
    'New Maninagar': { latitude: 23.0456, longitude: 72.5723 },
    'Mahadev Nagar': { latitude: 23.0356, longitude: 72.5823 },
    'Odhav': { latitude: 23.0256, longitude: 72.5923 },
    'Ramol': { latitude: 23.0156, longitude: 72.5823 },
    'Vejalpur': { latitude: 23.0056, longitude: 72.5723 },
    'Vijay Nagar': { latitude: 22.9956, longitude: 72.5623 },
    'Vavol': { latitude: 22.9856, longitude: 72.5523 },
    'Maninagar': { latitude: 23.0456, longitude: 72.5723 },
    'Naroda': { latitude: 23.0756, longitude: 72.5923 },
    'Narol': { latitude: 23.0656, longitude: 72.6023 },
    'Asarwa': { latitude: 23.0556, longitude: 72.6123 },
    'Sabarmati': { latitude: 23.0856, longitude: 72.5823 },
    'Naranpura': { latitude: 23.0456, longitude: 72.5923 },
    'Usmanpura': { latitude: 23.0356, longitude: 72.6023 },
    'C.G. Road': { latitude: 23.0256, longitude: 72.6123 },
    'Drive-In Road': { latitude: 23.0156, longitude: 72.6223 },
    'Thaltej': { latitude: 23.0056, longitude: 72.6323 },
    'Prahladnagar': { latitude: 22.9956, longitude: 72.6423 },
    'S.G. Highway': { latitude: 22.9856, longitude: 72.6523 }
  },
  'Baroda': {
    'Alkapuri': { latitude: 22.3072, longitude: 73.1812 },
    'Sayajigunj': { latitude: 22.3172, longitude: 73.1912 },
    'Fatehgunj': { latitude: 22.3272, longitude: 73.2012 },
    'Rajmahal Road': { latitude: 22.3372, longitude: 73.2112 },
    'Akshar Chowk': { latitude: 22.3472, longitude: 73.2212 },
    'Old Padra Road': { latitude: 22.3572, longitude: 73.2312 },
    'New Padra Road': { latitude: 22.3672, longitude: 73.2412 },
    'Gotri': { latitude: 22.3772, longitude: 73.2512 },
    'Makarpura': { latitude: 22.3872, longitude: 73.2612 },
    'Subhanpura': { latitude: 22.3972, longitude: 73.2712 },
    'Karelibaug': { latitude: 22.4072, longitude: 73.2812 },
    'Vadodara Railway Station': { latitude: 22.4172, longitude: 73.2912 },
    'Manjalpur': { latitude: 22.4272, longitude: 73.3012 },
    'Tandalja': { latitude: 22.4372, longitude: 73.3112 },
    'Harni': { latitude: 22.4472, longitude: 73.3212 },
    'Vasna': { latitude: 22.4572, longitude: 73.3312 },
    'Akota': { latitude: 22.4672, longitude: 73.3412 },
    'Sama': { latitude: 22.4772, longitude: 73.3512 },
    'Vadodara Central': { latitude: 22.4872, longitude: 73.3612 },
    'Race Course': { latitude: 22.4972, longitude: 73.3712 },
    'Navlakhi Compound': { latitude: 22.5072, longitude: 73.3812 },
    'Raopura': { latitude: 22.5172, longitude: 73.3912 },
    'Mandvi': { latitude: 22.5272, longitude: 73.4012 },
    'Wadi': { latitude: 22.5372, longitude: 73.4112 },
    'Kala Ghoda': { latitude: 22.5472, longitude: 73.4212 },
    'Bhayli': { latitude: 22.5572, longitude: 73.4312 },
    'Dumad': { latitude: 22.5672, longitude: 73.4412 },
    'Tarsali': { latitude: 22.5772, longitude: 73.4512 }
  },
  'Gandhinagar': {
    'Sector 1': { latitude: 23.2156, longitude: 72.6369 },
    'Sector 2': { latitude: 23.2256, longitude: 72.6469 },
    'Sector 3': { latitude: 23.2356, longitude: 72.6569 },
    'Sector 4': { latitude: 23.2456, longitude: 72.6669 },
    'Sector 5': { latitude: 23.2556, longitude: 72.6769 },
    'Sector 6': { latitude: 23.2656, longitude: 72.6869 },
    'Sector 7': { latitude: 23.2756, longitude: 72.6969 },
    'Sector 8': { latitude: 23.2856, longitude: 72.7069 },
    'Sector 9': { latitude: 23.2956, longitude: 72.7169 },
    'Sector 10': { latitude: 23.3056, longitude: 72.7269 },
    'Sector 11': { latitude: 23.3156, longitude: 72.7369 },
    'Sector 12': { latitude: 23.3256, longitude: 72.7469 },
    'Sector 13': { latitude: 23.3356, longitude: 72.7569 },
    'Sector 14': { latitude: 23.3456, longitude: 72.7669 },
    'Sector 15': { latitude: 23.3556, longitude: 72.7769 },
    'Sector 16': { latitude: 23.3656, longitude: 72.7869 },
    'Sector 17': { latitude: 23.3756, longitude: 72.7969 },
    'Sector 18': { latitude: 23.3856, longitude: 72.8069 },
    'Sector 19': { latitude: 23.3956, longitude: 72.8169 },
    'Sector 20': { latitude: 23.4056, longitude: 72.8269 },
    'Sector 21': { latitude: 23.4156, longitude: 72.8369 },
    'Sector 22': { latitude: 23.4256, longitude: 72.8469 },
    'Sector 23': { latitude: 23.4356, longitude: 72.8569 },
    'Sector 24': { latitude: 23.4456, longitude: 72.8669 },
    'Sector 25': { latitude: 23.4556, longitude: 72.8769 },
    'Sector 26': { latitude: 23.4656, longitude: 72.8869 },
    'Sector 27': { latitude: 23.4756, longitude: 72.8969 },
    'Sector 28': { latitude: 23.4856, longitude: 72.9069 },
    'Sector 29': { latitude: 23.4956, longitude: 72.9169 },
    'Sector 30': { latitude: 23.5056, longitude: 72.9269 },
    'Infocity': { latitude: 23.5156, longitude: 72.9369 },
    'GIFT City': { latitude: 23.5256, longitude: 72.9469 },
    'Capital Complex': { latitude: 23.5356, longitude: 72.9569 },
    'Pragatinagar': { latitude: 23.5456, longitude: 72.9669 }
  },
  'Rajkot': {
    'Kalavad Road': { latitude: 22.3039, longitude: 70.8022 },
    '150 Feet Ring Road': { latitude: 22.3139, longitude: 70.8122 },
    'University Road': { latitude: 22.3239, longitude: 70.8222 },
    'Gondal Road': { latitude: 22.3339, longitude: 70.8322 },
    'Bhavsar Para': { latitude: 22.3439, longitude: 70.8422 },
    'Jagnath Plot': { latitude: 22.3539, longitude: 70.8522 },
    'Gujarat College Road': { latitude: 22.3639, longitude: 70.8622 },
    'Mavdi Road': { latitude: 22.3739, longitude: 70.8722 },
    'Shastri Nagar': { latitude: 22.3839, longitude: 70.8822 },
    'Kalawad Road': { latitude: 22.3939, longitude: 70.8922 },
    'Dhebar Road': { latitude: 22.4039, longitude: 70.9022 },
    'Paldi': { latitude: 22.4139, longitude: 70.9122 },
    'Sadar': { latitude: 22.4239, longitude: 70.9222 },
    'Raiya Road': { latitude: 22.4339, longitude: 70.9322 },
    'Bedipara': { latitude: 22.4439, longitude: 70.9422 },
    'Trikonbaug': { latitude: 22.4539, longitude: 70.9522 },
    'Limbdi Chowk': { latitude: 22.4639, longitude: 70.9622 },
    'Lakhajiraj Road': { latitude: 22.4739, longitude: 70.9722 },
    'Dhebarbhai Road': { latitude: 22.4839, longitude: 70.9822 },
    'Nana Mava Road': { latitude: 22.4939, longitude: 70.9922 },
    'Kotharia Road': { latitude: 22.5039, longitude: 71.0022 },
    'Morbi Road': { latitude: 22.5139, longitude: 71.0122 },
    'Jamnagar Road': { latitude: 22.5239, longitude: 71.0222 },
    'Bhakti Nagar': { latitude: 22.5339, longitude: 71.0322 },
    'Vidhyanagar': { latitude: 22.5439, longitude: 71.0422 },
    'Sanand Road': { latitude: 22.5539, longitude: 71.0522 }
  },
  'Surat': {
    'Adajan': { latitude: 21.1702, longitude: 72.8311 },
    'Athwa': { latitude: 21.1802, longitude: 72.8411 },
    'Begumpura': { latitude: 21.1902, longitude: 72.8511 },
    'City Light': { latitude: 21.2002, longitude: 72.8611 },
    'Dumas': { latitude: 21.2102, longitude: 72.8711 },
    'Ghod Dod Road': { latitude: 21.2202, longitude: 72.8811 },
    'Katargam': { latitude: 21.2302, longitude: 72.8911 },
    'Limbayat': { latitude: 21.2402, longitude: 72.9011 },
    'Magdalla': { latitude: 21.2502, longitude: 72.9111 },
    'Pal': { latitude: 21.2602, longitude: 72.9211 },
    'Piplod': { latitude: 21.2702, longitude: 72.9311 },
    'Rander': { latitude: 21.2802, longitude: 72.9411 },
    'Sachin': { latitude: 21.2902, longitude: 72.9511 },
    'Salabatpura': { latitude: 21.3002, longitude: 72.9611 },
    'Sarthana': { latitude: 21.3102, longitude: 72.9711 },
    'Udhna': { latitude: 21.3202, longitude: 72.9811 },
    'Varachha': { latitude: 21.3302, longitude: 72.9911 },
    'Vesu': { latitude: 21.3402, longitude: 73.0011 },
    'Athwalines': { latitude: 21.3502, longitude: 73.0111 },
    'Bhatar': { latitude: 21.3602, longitude: 73.0211 },
    'Chowk Bazar': { latitude: 21.3702, longitude: 73.0311 },
    'Dindoli': { latitude: 21.3802, longitude: 73.0411 },
    'Gopipura': { latitude: 21.3902, longitude: 73.0511 },
    'Hajira': { latitude: 21.4002, longitude: 73.0611 },
    'Ichchhapor': { latitude: 21.4102, longitude: 73.0711 },
    'Jakatnaka': { latitude: 21.4202, longitude: 73.0811 },
    'Karanj': { latitude: 21.4302, longitude: 73.0911 },
    'Katodara': { latitude: 21.4402, longitude: 73.1011 },
    'Lal Darwaja': { latitude: 21.4502, longitude: 73.1111 },
    'Mota Varachha': { latitude: 21.4602, longitude: 73.1211 },
    'Nana Varachha': { latitude: 21.4702, longitude: 73.1311 },
    'Pandesara': { latitude: 21.4802, longitude: 73.1411 },
    'Parvat Patiya': { latitude: 21.4902, longitude: 73.1511 },
    'Sachin GIDC': { latitude: 21.5002, longitude: 73.1611 },
    'Sagrampura': { latitude: 21.5102, longitude: 73.1711 },
    'Sahajanand': { latitude: 21.5202, longitude: 73.1811 },
    'Sayan': { latitude: 21.5302, longitude: 73.1911 },
    'Timaliyawad': { latitude: 21.5402, longitude: 73.2011 },
    'Umarwada': { latitude: 21.5502, longitude: 73.2111 },
    'Wadifaliya': { latitude: 21.5602, longitude: 73.2211 },
    'Zampa Bazar': { latitude: 21.5702, longitude: 73.2311 }
  }
};

// Real Uber API integration (commented out for demonstration)
// You would need to implement proper authentication and API calls
/*
export const getRealUberPriceEstimates = async (
  startLatitude: number,
  startLongitude: number,
  endLatitude: number,
  endLongitude: number,
  accessToken: string
): Promise<UberPriceEstimate[]> => {
  const response = await fetch(
    `https://api.uber.com/v1.2/estimates/price?start_latitude=${startLatitude}&start_longitude=${startLongitude}&end_latitude=${endLatitude}&end_longitude=${endLongitude}`,
    {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept-Language': 'en_US',
        'Content-Type': 'application/json'
      }
    }
  );

  if (!response.ok) {
    throw new Error('Failed to fetch Uber price estimates');
  }

  const data = await response.json();
  return data.prices;
};
*/
