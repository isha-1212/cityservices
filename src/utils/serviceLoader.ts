import Papa from 'papaparse';
import mockServices, { Service } from '../data/mockServices';

interface CSVRow {
  [key: string]: string;
}

const normalizeCity = (city: string): string => {
  return city.trim().toLowerCase();
};

const parseCSV = (url: string): Promise<CSVRow[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse(url, {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        resolve(results.data as CSVRow[]);
      },
      error: (error) => {
        reject(error);
      }
    });
  });
};

const mapAccommodationToService = (row: CSVRow, city: string): Service | null => {
  try {
    const name = row.name || row.Name || row.title || row.Title || '';
    const priceStr = row.rent || row.Rent || row.price || row.Price || '0';
    const price = parseFloat(priceStr.replace(/[^0-9.]/g, '')) || 0;

    if (!name || price === 0) return null;

    return {
      id: `acc_${city}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      type: 'accommodation',
      city: city.charAt(0).toUpperCase() + city.slice(1),
      price,
      rating: parseFloat(row.rating || row.Rating || '4.0'),
      description: row.description || row.Description || row.address || row.Address || '',
      image: row.image || row.Image || 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=400',
      features: [],
      meta: row
    };
  } catch (error) {
    console.error('Error mapping accommodation:', error);
    return null;
  }
};

const mapTiffinToService = (row: CSVRow): Service | null => {
  try {
    const name = row.Name || row.name || '';
    const city = row.City || row.city || 'Ahmedabad';
    const priceStr = row.Estimated_Price_Per_Tiffin_INR || row.price || '95';
    const priceMatch = priceStr.match(/\d+/);
    const price = priceMatch ? parseFloat(priceMatch[0]) : 95;

    if (!name) return null;

    return {
      id: `tiffin_${Math.random().toString(36).substr(2, 9)}`,
      name,
      type: 'tiffin',
      city,
      price,
      rating: parseFloat(row.Rating || row.rating || '4.0'),
      description: row.Address || row.address || row.Description || '',
      image: row.Menu || row.image || 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400',
      features: row.Hours ? [row.Hours] : [],
      meta: row
    };
  } catch (error) {
    console.error('Error mapping tiffin:', error);
    return null;
  }
};

const mapFoodToService = (row: CSVRow): Service | null => {
  try {
    const name = row.restaurant_name || row.name || row.Name || '';
    const city = row.city || row.City || 'Ahmedabad';
    const priceStr = row.avg_price_per_meal || row.price || row.Price || '150';
    const price = parseFloat(priceStr.replace(/[^0-9.]/g, '')) || 150;

    if (!name) return null;

    return {
      id: `food_${Math.random().toString(36).substr(2, 9)}`,
      name,
      type: 'food',
      city,
      price,
      rating: parseFloat(row.rating || row.Rating || '4.0'),
      description: row.cuisine || row.Cuisine || row.description || '',
      image: row.image || 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400',
      features: [],
      meta: row
    };
  } catch (error) {
    console.error('Error mapping food:', error);
    return null;
  }
};

export const loadAllServices = async (): Promise<Service[]> => {
  const services: Service[] = [...mockServices];

  try {
    const accommodationFiles = [
      { city: 'Ahmedabad', url: '/data/Accomodation/Ahmedabad-with-images.csv' },
      { city: 'Vadodara', url: '/data/Accomodation/Baroda.csv' },
      { city: 'Gandhinagar', url: '/data/Accomodation/Gandhinagar.csv' },
      { city: 'Rajkot', url: '/data/Accomodation/Rajkot.csv' },
      { city: 'Surat', url: '/data/Accomodation/Surat.csv' }
    ];

    const accommodationPromises = accommodationFiles.map(async ({ city, url }) => {
      try {
        const rows = await parseCSV(url);
        return rows
          .map(row => mapAccommodationToService(row, city))
          .filter((s): s is Service => s !== null);
      } catch (error) {
        console.warn(`Failed to load ${city} accommodation:`, error);
        return [];
      }
    });

    const tiffinPromise = parseCSV('/data/Food/tifin_rental.csv')
      .then(rows => rows.map(mapTiffinToService).filter((s): s is Service => s !== null))
      .catch(() => []);

    const foodPromise = parseCSV('/data/Food/gujrat_food.csv')
      .then(rows => rows.map(mapFoodToService).filter((s): s is Service => s !== null))
      .catch(() => []);

    const [accommodationResults, tiffinResults, foodResults] = await Promise.all([
      Promise.all(accommodationPromises),
      tiffinPromise,
      foodPromise
    ]);

    accommodationResults.forEach(results => services.push(...results));
    services.push(...tiffinResults);
    services.push(...foodResults);

    console.log(`Loaded ${services.length} total services`);
    return services;
  } catch (error) {
    console.error('Error loading services from CSVs:', error);
    return services;
  }
};
