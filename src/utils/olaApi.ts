// Ola API integration utilities
// Based on Ola's ride estimate API documentation
// https://developers.olacabs.com/docs/ride-estimate

export interface OlaPriceEstimate {
  category: string;
  distance: number;
  travel_time_in_minutes: number;
  amount_min: number;
  amount_max: number;
  booking_fee: number;
  upfront?: {
    fare: number;
    fare_id: string;
    is_upfront_applicable: boolean;
  };
}

export interface OlaCategory {
  id: string;
  display_name: string;
  currency: string;
  eta: number;
  distance: string;
  image: string;
  cancellation_policy: {
    cancellation_charge: number;
    currency: string;
    cancellation_charge_applies_after_time: number;
    time_unit: string;
  };
  fare_breakup: Array<{
    type: string;
    base_fare: number;
    minimum_fare: number;
    cost_per_distance: number;
    ride_cost_per_minute: number;
    rates_lower_than_usual: boolean;
    rates_higher_than_usual: boolean;
  }>;
}

export interface OlaResponse {
  categories: OlaCategory[];
  ride_estimate: OlaPriceEstimate[];
}

// Mock Ola API responses for demonstration
// In production, replace with actual Ola API calls
export const getOlaPriceEstimates = async (
  pickupLat: number,
  pickupLng: number,
  dropLat: number,
  dropLng: number
): Promise<OlaResponse> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1200));

  // Mock response based on distance calculation
  const distance = calculateDistance(pickupLat, pickupLng, dropLat, dropLng);
  
  return {
    categories: [
      {
        id: 'micro',
        display_name: 'Ola Micro',
        currency: 'INR',
        eta: Math.round(distance * 1.2 + 5),
        distance: '0.5',
        image: '🚗',
        cancellation_policy: {
          cancellation_charge: 15,
          currency: 'INR',
          cancellation_charge_applies_after_time: 5,
          time_unit: 'minute'
        },
        fare_breakup: [{
          type: 'flat_rate',
          base_fare: 40,
          minimum_fare: 50,
          cost_per_distance: 7,
          ride_cost_per_minute: 1,
          rates_lower_than_usual: false,
          rates_higher_than_usual: false
        }]
      },
      {
        id: 'mini',
        display_name: 'Ola Mini',
        currency: 'INR',
        eta: Math.round(distance * 1.1 + 8),
        distance: '0.8',
        image: '🚙',
        cancellation_policy: {
          cancellation_charge: 15,
          currency: 'INR',
          cancellation_charge_applies_after_time: 5,
          time_unit: 'minute'
        },
        fare_breakup: [{
          type: 'flat_rate',
          base_fare: 55,
          minimum_fare: 65,
          cost_per_distance: 9,
          ride_cost_per_minute: 1,
          rates_lower_than_usual: false,
          rates_higher_than_usual: false
        }]
      },
      {
        id: 'prime',
        display_name: 'Ola Prime',
        currency: 'INR',
        eta: Math.round(distance * 1.0 + 10),
        distance: '1.2',
        image: '🚐',
        cancellation_policy: {
          cancellation_charge: 20,
          currency: 'INR',
          cancellation_charge_applies_after_time: 5,
          time_unit: 'minute'
        },
        fare_breakup: [{
          type: 'flat_rate',
          base_fare: 75,
          minimum_fare: 85,
          cost_per_distance: 12,
          ride_cost_per_minute: 2,
          rates_lower_than_usual: false,
          rates_higher_than_usual: false
        }]
      },
      {
        id: 'auto',
        display_name: 'Ola Auto',
        currency: 'INR',
        eta: Math.round(distance * 1.3 + 3),
        distance: '0.3',
        image: '🛺',
        cancellation_policy: {
          cancellation_charge: 10,
          currency: 'INR',
          cancellation_charge_applies_after_time: 5,
          time_unit: 'minute'
        },
        fare_breakup: [{
          type: 'flat_rate',
          base_fare: 30,
          minimum_fare: 40,
          cost_per_distance: 6,
          ride_cost_per_minute: 0.5,
          rates_lower_than_usual: false,
          rates_higher_than_usual: false
        }]
      }
    ],
    ride_estimate: [
      {
        category: 'micro',
        distance: distance,
        travel_time_in_minutes: Math.round(distance * 1.5 + 10),
        amount_min: Math.round(40 + distance * 7),
        amount_max: Math.round(50 + distance * 7 + 20),
        booking_fee: 30,
        upfront: {
          fare: Math.round(40 + distance * 7 + 15),
          fare_id: `ola_micro_${Date.now()}`,
          is_upfront_applicable: true
        }
      },
      {
        category: 'mini',
        distance: distance,
        travel_time_in_minutes: Math.round(distance * 1.4 + 12),
        amount_min: Math.round(55 + distance * 9),
        amount_max: Math.round(65 + distance * 9 + 25),
        booking_fee: 30,
        upfront: {
          fare: Math.round(55 + distance * 9 + 18),
          fare_id: `ola_mini_${Date.now()}`,
          is_upfront_applicable: true
        }
      },
      {
        category: 'prime',
        distance: distance,
        travel_time_in_minutes: Math.round(distance * 1.3 + 15),
        amount_min: Math.round(75 + distance * 12),
        amount_max: Math.round(85 + distance * 12 + 30),
        booking_fee: 30,
        upfront: {
          fare: Math.round(75 + distance * 12 + 22),
          fare_id: `ola_prime_${Date.now()}`,
          is_upfront_applicable: true
        }
      },
      {
        category: 'auto',
        distance: distance,
        travel_time_in_minutes: Math.round(distance * 1.3 + 8),
        amount_min: Math.round(30 + distance * 6),
        amount_max: Math.round(40 + distance * 6 + 15),
        booking_fee: 30,
        upfront: {
          fare: Math.round(30 + distance * 6 + 12),
          fare_id: `ola_auto_${Date.now()}`,
          is_upfront_applicable: true
        }
      }
    ]
  };
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

// Real Ola API integration (commented out for demonstration)
// You would need to implement proper authentication and API calls
/*
export const getRealOlaPriceEstimates = async (
  pickupLat: number,
  pickupLng: number,
  dropLat: number,
  dropLng: number,
  appToken: string,
  authToken?: string
): Promise<OlaResponse> => {
  const headers: Record<string, string> = {
    'x-app-token': appToken,
    'Content-Type': 'application/json'
  };

  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  const response = await fetch(
    `https://devapi.olacabs.com/v1/products?pickup_lat=${pickupLat}&pickup_lng=${pickupLng}&drop_lat=${dropLat}&drop_lng=${dropLng}&service_type=p2p`,
    {
      method: 'GET',
      headers
    }
  );

  if (!response.ok) {
    throw new Error('Failed to fetch Ola price estimates');
  }

  const data = await response.json();
  return data;
};
*/
