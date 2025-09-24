import React, { useEffect, useState } from 'react';
import { mockServices, Service } from '../data/mockServices';
import ServiceDetails from './ServiceDetails';
import Papa from 'papaparse';
import { VAISHNO_IMAGE, VAISHNO_LISTING } from '../data/areas/vaishno_devi_circle';
import { SHANTIGRAM_IMAGE, SHANTIGRAM_LISTING } from '../data/areas/shantigram';
import { JAGATPUR_IMAGE, JAGATPUR_LISTING } from '../data/areas/jagatpur';
import { BODAKDEV_IMAGE, BODAKDEV_LISTING } from '../data/areas/bodakdev';
import { MOTERA_IMAGE, MOTERA_LISTING } from '../data/areas/motera';
import { BOPAL_IMAGE, BOPAL_LISTING } from '../data/areas/bopal';
import { CHANDKHEDA_IMAGE, CHANDKHEDA_LISTING } from '../data/areas/chandkheda';
import { SHELA_IMAGE, SHELA_LISTING } from '../data/areas/shela';
import { CHHARODI_IMAGE, CHHARODI_LISTING } from '../data/areas/chharodi';
import { SANAND_IMAGE, SANAND_LISTING } from '../data/areas/sanand';
import { SHILAJ_IMAGE, SHILAJ_LISTING } from '../data/areas/shilaj';
import { TRAGAD_IMAGE, TRAGAD_LISTING } from '../data/areas/tragad';
import { VASTRAPUR_IMAGE, VASTRAPUR_LISTING } from '../data/areas/vastrapur';
import { AMBLI_IMAGE, AMBLI_LISTING } from '../data/areas/ambli';
import { PALDI_IMAGE, PALDI_LISTING } from '../data/areas/paldi';
import { SATELLITE_IMAGE, SATELLITE_LISTING } from '../data/areas/satellite';
import { GHUMA_IMAGE, GHUMA_LISTING } from '../data/areas/ghuma';
import { ELLISBRIDGE_IMAGE, ELLISBRIDGE_LISTING } from '../data/areas/ellisbridge';
import { GOTA_IMAGE, GOTA_LISTING } from '../data/areas/gota';
import { NAVRANGPURA_IMAGE, NAVRANGPURA_LISTING } from '../data/areas/navrangpura';
import { SOLA_IMAGE, SOLA_LISTING } from '../data/areas/sola';
import { JODHPUR_IMAGE, JODHPUR_LISTING } from '../data/areas/jodhpur';
import { MAKARBA_IMAGE, MAKARBA_LISTING } from '../data/areas/makarba';
import { VASTRAL_IMAGE, VASTRAL_LISTING } from '../data/areas/vastral';
import { NEW_MANINAGAR_IMAGE, NEW_MANINAGAR_LISTING } from '../data/areas/new_maninagar';
import { MAHADEV_NAGAR_IMAGE, MAHADEV_NAGAR_LISTING } from '../data/areas/mahadev_nagar';
import { ODHAV_IMAGE, ODHAV_LISTING } from '../data/areas/odhav';
import { RAMOL_IMAGE, RAMOL_LISTING } from '../data/areas/ramol';
import { Search, MapPin, Star, Bookmark, BookmarkCheck } from 'lucide-react';

// shared Service type is available in data module if needed

export const ServiceSearch: React.FC = () => {
  // Map tifin_rental.csv row to Service
  const mapTiffinRow = (row: any, idx: number): Service => {
    const id = `tiffin-${idx}`;
    const priceStr = row['Estimated_Price_Per_Tiffin_INR'] || '';
      // Always get city from last column
      let price = 0;
      const match = priceStr.match(/\d+/g);
      if (match && match.length > 0) price = Number(match[0]);
    const rating = Number(row['Rating']) || computeNearbyFour(id);
    const name = row['Name'] || 'Tiffin Service';
    const city = row['City'] || '';
  const description = `${row['Type'] || 'Tiffin Service'}${row['Address'] ? ' at ' + row['Address'] : ''}`;
  const image = row['Menu'] || 'https://via.placeholder.com/300x200?text=Tiffin+Service';
  return {
    id,
    name,
    type: 'tiffin',
    city: row['City'] || '',
    price,
    rating,
    description,
    image,
    features: [row['Type'], row['Hours'], row['Phone']].filter(Boolean),
    meta: row,
  } as Service;
  };
  const [selectedCity, setSelectedCity] = useState('');
  const [minBudget, setMinBudget] = useState(() => {
    try { return Number(localStorage.getItem('search_min_budget')) || 0; } catch { return 0; }
  });
  const [maxBudget, setMaxBudget] = useState(() => {
    try { return Number(localStorage.getItem('search_max_budget')) || 25000; } catch { return 25000; }
  });
  const [selectedServiceTypes, setSelectedServiceTypes] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState(() => {
    try { return localStorage.getItem('search_term') || ''; } catch { return ''; }
  });
  const [foodItem, setFoodItem] = useState('');
  const [showAreaDropdown, setShowAreaDropdown] = useState(false);
  const areaButtonRef = React.useRef<HTMLDivElement | null>(null);
  const [showTypesDropdown, setShowTypesDropdown] = useState(false);
  const typesDropdownRef = React.useRef<HTMLDivElement | null>(null);
  const [bookmarkIdMap, setBookmarkIdMap] = useState<Record<string, number>>({});
  const [selected, setSelected] = useState<Service | null>(null);
    const [bookmarked, setBookmarked] = useState<Set<string>>(new Set());
    // Area options per city
    const areaOptionsMap: Record<string, string[]> = {
      Ahmedabad: [
        'Vaishno Devi Circle', 'Shantigram', 'Jagatpur', 'Bodakdev', 'Motera', 'Bopal', 'Chandkheda', 'Shela', 'Chharodi', 'Sanand', 'Shilaj', 'Tragad', 'Vastrapur', 'Ambli', 'Paldi', 'Satellite', 'Ghuma', 'Ellisbridge', 'Gota', 'Navrangpura', 'Sola', 'Jodhpur', 'Makarba', 'Vastral', 'New Maninagar', 'Mahadev Nagar', 'Odhav', 'Ramol'
      ],
      Baroda: [
        'Alkapuri', 'Fatehgunj', 'Gotri', 'Manjalpur', 'Makarpura', 'Karelibaug', 'Vasna', 'Waghodia Road'
      ],
      Gandhinagar: [
        'Sector 1', 'Sector 2', 'Sector 6', 'Sector 11', 'Sector 21', 'Sector 22', 'Sector 23', 'Sector 24', 'Sector 25', 'Sector 26', 'Sector 27', 'Sector 28'
      ],
      Rajkot: [
        'Kalavad Road', 'Yagnik Road', 'University Road', '150 Feet Ring Road', 'Mavdi', 'Amin Marg', 'Sadar'
      ],
      Surat: [
        'Adajan', 'Vesu', 'Piplod', 'City Light', 'Katargam', 'Varachha', 'Udhna', 'Athwa'
      ],
    };
    const areaOptions = areaOptionsMap[selectedCity] || [];
    const normalizedKnownAreas = new Set(areaOptions.map(a => a.toString().trim().toLowerCase()));

  // Close dropdowns when clicking outside
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (showAreaDropdown) {
        const el = areaButtonRef.current;
        if (el && !el.contains(e.target as Node)) setShowAreaDropdown(false);
      }
      if (showTypesDropdown) {
        const t = typesDropdownRef.current;
        if (t && !t.contains(e.target as Node)) setShowTypesDropdown(false);
      }
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [showAreaDropdown, showTypesDropdown]);

  // Bookmarks: fetch from localStorage and backend
  useEffect(() => {
    const init = async () => {
      try {
        const raw = localStorage.getItem('local_bookmarks');
        if (raw) {
          const arr: string[] = JSON.parse(raw);
          setBookmarked(new Set(arr));
        }
      } catch (e) {
        console.warn('Failed to read local_bookmarks', e);
      }
      const token = localStorage.getItem('token');
      if (!token) return;
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);
        const res = await fetch('/api/bookmarks', {
          headers: { 'Authorization': `Bearer ${token}` },
          signal: controller.signal
        });
        clearTimeout(timeoutId);
        if (!res.ok) {
          console.warn(`Bookmarks API returned ${res.status}, using local bookmarks only`);
          return;
        }
        const data = await res.json();
        const set = new Set<string>();
        const map: Record<string, number> = {};
        (data.bookmarks || []).forEach((b: any) => {
          set.add(b.service_id);
          map[b.service_id] = b.id;
        });
        setBookmarked(set);
        setBookmarkIdMap(map);
        try { localStorage.setItem('local_bookmarks', JSON.stringify(Array.from(set))); } catch (e) { }
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          console.warn('Bookmarks API timeout, using local bookmarks only');
        } else {
          console.warn('Failed to load bookmarks from server, using local bookmarks:', err instanceof Error ? err.message : String(err));
        }
      }
    };
    init();
  }, []);

  // close dropdown when clicking outside
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (showAreaDropdown) {
        const el = areaButtonRef.current;
        if (el && !el.contains(e.target as Node)) setShowAreaDropdown(false);
      }
      if (showTypesDropdown) {
        const t = typesDropdownRef.current;
        if (t && !t.contains(e.target as Node)) setShowTypesDropdown(false);
      }
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [showAreaDropdown, showTypesDropdown]);

  // Restore selectedCity from localStorage so filters persist across pages
  useEffect(() => {
    try {
      const sc = localStorage.getItem('selected_city');
      if (sc) setSelectedCity(sc);
    } catch (e) {
      console.warn('Failed to restore selected city', e);
    }
  }, []);

  // Restore selected serviceTypes from localStorage so this filter persists too
  useEffect(() => {
    try {
      const st = localStorage.getItem('selected_service_types');
      if (st) {
        const parsedTypes = JSON.parse(st);
        if (Array.isArray(parsedTypes)) {
          setSelectedServiceTypes(parsedTypes);
        }
      }
    } catch (e) {
      console.warn('Failed to restore selected service types', e);
    }
  }, []);

  // keep in-sync with other components/tabs when local_bookmarks changes
  useEffect(() => {
    const refreshFromLocal = () => {
      try {
        const raw = localStorage.getItem('local_bookmarks');
        if (raw) {
          const arr: string[] = JSON.parse(raw);
          setBookmarked(new Set(arr));
        } else {
          setBookmarked(new Set());
        }
      } catch (e) {
        console.warn('Failed to refresh bookmarks from local', e);
      }
    };

    const handler = () => refreshFromLocal();
    const storageHandler = (e: StorageEvent) => {
      if (e.key === 'local_bookmarks') refreshFromLocal();
    };

    window.addEventListener('bookmarks:changed', handler);
    window.addEventListener('storage', storageHandler);
    return () => {
      window.removeEventListener('bookmarks:changed', handler);
      window.removeEventListener('storage', storageHandler);
    };
  }, []);

  // Only Gujarat cities (match public/data/Accomodation CSV filenames)
  const cities = ['Ahmedabad', 'Baroda', 'Gandhinagar', 'Rajkot', 'Surat'];
  const serviceTypes = [
    { id: 'accommodation', label: 'Accommodation', icon: '🏠' },
    { id: 'food', label: 'Food', icon: '🍽️' },
    { id: 'tiffin', label: 'Tiffin Services', icon: '🥗' },
    { id: 'transport', label: 'Transport', icon: '🚗' },
    { id: 'coworking', label: 'Coworking', icon: '💼' },
    { id: 'utilities', label: 'Utilities', icon: '⚡' },
  ];


  // use shared mockServices from data module but allow CSV loading for accommodation/food
  const [csvServices, setCsvServices] = useState<Service[] | null>(null);
  const [isLoadingCsv, setIsLoadingCsv] = useState(false);
  const [csvError, setCsvError] = useState<string | null>(null);

  // Progressive loading removed for now (simplified to single-batch sampling)

  // Small helper: compute a stable pseudo-random rating around 4.0 based on an input string
  const computeNearbyFour = (seed: string) => {
    // simple hash of seed -> [0,1)
    let h = 2166136261 >>> 0;
    for (let i = 0; i < seed.length; i++) {
      h ^= seed.charCodeAt(i);
      h = Math.imul(h, 16777619) >>> 0;
    }
    // map to 0..1
    const r = (h % 1000) / 1000;
    // map to a small variance around 4.0, e.g., 3.7..4.3
    const v = 3.7 + r * 0.6;
    // round to one decimal, e.g., 3.8, 4.0, 4.3
    return Math.round(v * 10) / 10;
  };

  // Display rating for cards (stable pseudo-random ~4.0)
  const displayRating = (service: Service) => computeNearbyFour(service.id);

  // normalize accommodation CSV row to Service
  const mapAccommodationRow = (row: any): Service | null => {
    try {
      const id = `${row.City || 'Surat'}-${(row['Locality / Area'] || 'unknown')}-${(row['Rent Price'] || '0')}`.replace(/\s+/g, '-');
      const rawRent = row['Rent Price'];
      // More robust price parsing
      let price = 0;
      if (rawRent) {
        const cleanRent = rawRent.toString().replace(/[^0-9.]/g, '');
        price = Number(cleanRent) || 0;
      }
      
      const svc = {
        id: id,
        name: `${row['Property Type'] || 'Property'} - ${row['Locality / Area'] || row.Locality}`,
        type: 'accommodation',
        city: row.City || selectedCity || 'Surat',
        price: price,
        rating: computeNearbyFour(id),
        description: row['Additional Notes'] || row.Amenities || '',
        image: '',
        features: (row.Amenities || '').split(/[,|;]/).map((s: string) => s.trim()).filter(Boolean),
      } as Service;
      
      // Inject area-specific images + listing when locality matches
      const locality = (row['Locality / Area'] || row['Locality'] || '').toString().trim();
      const city = (row['City'] || '').toString().trim().toLowerCase();
      if (locality && locality.toLowerCase() === 'vaishno devi circle') {
        svc.image = VAISHNO_IMAGE;
        // attach listing link into meta as well so ServiceDetails can show Visit listing
        (svc as any).meta = { ...(row || {}), ['Listing Link']: VAISHNO_LISTING };
      }

      // Inject Shantigram image + listing for Ahmedabad -> Shantigram
      if (locality && locality.toLowerCase() === 'shantigram' && city === 'ahmedabad') {
        svc.image = SHANTIGRAM_IMAGE;
        (svc as any).meta = { ...(row || {}), ['Listing Link']: SHANTIGRAM_LISTING };
      }

      // Inject Jagatpur image + listing for Ahmedabad -> Jagatpur
      if (locality && locality.toLowerCase() === 'jagatpur' && city === 'ahmedabad') {
        svc.image = JAGATPUR_IMAGE;
        (svc as any).meta = { ...(row || {}), ['Listing Link']: JAGATPUR_LISTING };
      }

      // Inject Bodakdev image + listing for Ahmedabad -> Bodakdev
      if (locality && locality.toLowerCase() === 'bodakdev' && city === 'ahmedabad') {
        svc.image = BODAKDEV_IMAGE;
        (svc as any).meta = { ...(row || {}), ['Listing Link']: BODAKDEV_LISTING };
      }

      // Inject Motera image + listing for Ahmedabad -> Motera
      if (locality && locality.toLowerCase() === 'motera' && city === 'ahmedabad') {
        svc.image = MOTERA_IMAGE;
        (svc as any).meta = { ...(row || {}), ['Listing Link']: MOTERA_LISTING };
      }

      // Inject Bopal image + listing for Ahmedabad -> Bopal
      if (locality && locality.toLowerCase() === 'bopal' && city === 'ahmedabad') {
        svc.image = BOPAL_IMAGE;
        (svc as any).meta = { ...(row || {}), ['Listing Link']: BOPAL_LISTING };
      }

      // Chandkheda
      if (locality && locality.toLowerCase() === 'chandkheda' && city === 'ahmedabad') {
        svc.image = CHANDKHEDA_IMAGE;
        (svc as any).meta = { ...(row || {}), ['Listing Link']: CHANDKHEDA_LISTING };
      }

      // Shela
      if (locality && locality.toLowerCase() === 'shela' && city === 'ahmedabad') {
        svc.image = SHELA_IMAGE;
        (svc as any).meta = { ...(row || {}), ['Listing Link']: SHELA_LISTING };
      }

      // Chharodi
      if (locality && locality.toLowerCase() === 'chharodi' && city === 'ahmedabad') {
        svc.image = CHHARODI_IMAGE;
        (svc as any).meta = { ...(row || {}), ['Listing Link']: CHHARODI_LISTING };
      }

      // Sanand
      if (locality && locality.toLowerCase() === 'sanand' && city === 'ahmedabad') {
        svc.image = SANAND_IMAGE;
        (svc as any).meta = { ...(row || {}), ['Listing Link']: SANAND_LISTING };
      }

      // Shilaj
      if (locality && locality.toLowerCase() === 'shilaj' && city === 'ahmedabad') {
        svc.image = SHILAJ_IMAGE;
        (svc as any).meta = { ...(row || {}), ['Listing Link']: SHILAJ_LISTING };
      }

      // Tragad
      if (locality && locality.toLowerCase() === 'tragad' && city === 'ahmedabad') {
        svc.image = TRAGAD_IMAGE;
        (svc as any).meta = { ...(row || {}), ['Listing Link']: TRAGAD_LISTING };
      }

      // Vastrapur
      if (locality && locality.toLowerCase() === 'vastrapur' && city === 'ahmedabad') {
        svc.image = VASTRAPUR_IMAGE;
        (svc as any).meta = { ...(row || {}), ['Listing Link']: VASTRAPUR_LISTING };
      }

      // Ambli
      if (locality && locality.toLowerCase() === 'ambli' && city === 'ahmedabad') {
        svc.image = AMBLI_IMAGE;
        (svc as any).meta = { ...(row || {}), ['Listing Link']: AMBLI_LISTING };
      }

      // Paldi
      if (locality && locality.toLowerCase() === 'paldi' && city === 'ahmedabad') {
        svc.image = PALDI_IMAGE;
        (svc as any).meta = { ...(row || {}), ['Listing Link']: PALDI_LISTING };
      }

      // Satellite
      if (locality && locality.toLowerCase() === 'satellite' && city === 'ahmedabad') {
        svc.image = SATELLITE_IMAGE;
        (svc as any).meta = { ...(row || {}), ['Listing Link']: SATELLITE_LISTING };
      }

      // Ghuma
      if (locality && locality.toLowerCase() === 'ghuma' && city === 'ahmedabad') {
        svc.image = GHUMA_IMAGE;
        (svc as any).meta = { ...(row || {}), ['Listing Link']: GHUMA_LISTING };
      }

      // Ellisbridge
      if (locality && locality.toLowerCase() === 'ellisbridge' && city === 'ahmedabad') {
        svc.image = ELLISBRIDGE_IMAGE;
        (svc as any).meta = { ...(row || {}), ['Listing Link']: ELLISBRIDGE_LISTING };
      }

      // Gota
      if (locality && locality.toLowerCase() === 'gota' && city === 'ahmedabad') {
        svc.image = GOTA_IMAGE;
        (svc as any).meta = { ...(row || {}), ['Listing Link']: GOTA_LISTING };
      }

      // Navrangpura
      if (locality && locality.toLowerCase() === 'navrangpura' && city === 'ahmedabad') {
        svc.image = NAVRANGPURA_IMAGE;
        (svc as any).meta = { ...(row || {}), ['Listing Link']: NAVRANGPURA_LISTING };
      }

      // Sola
      if (locality && locality.toLowerCase() === 'sola' && city === 'ahmedabad') {
        svc.image = SOLA_IMAGE;
        (svc as any).meta = { ...(row || {}), ['Listing Link']: SOLA_LISTING };
      }

      // Jodhpur
      if (locality && locality.toLowerCase() === 'jodhpur' && city === 'ahmedabad') {
        svc.image = JODHPUR_IMAGE;
        (svc as any).meta = { ...(row || {}), ['Listing Link']: JODHPUR_LISTING };
      }

      // Makarba
      if (locality && locality.toLowerCase() === 'makarba' && city === 'ahmedabad') {
        svc.image = MAKARBA_IMAGE;
        (svc as any).meta = { ...(row || {}), ['Listing Link']: MAKARBA_LISTING };
      }

      // Vastral
      if (locality && locality.toLowerCase() === 'vastral' && city === 'ahmedabad') {
        svc.image = VASTRAL_IMAGE;
        (svc as any).meta = { ...(row || {}), ['Listing Link']: VASTRAL_LISTING };
      }

      // New Maninagar
      if (locality && locality.toLowerCase() === 'new maninagar' && city === 'ahmedabad') {
        svc.image = NEW_MANINAGAR_IMAGE;
        (svc as any).meta = { ...(row || {}), ['Listing Link']: NEW_MANINAGAR_LISTING };
      }

      // Mahadev Nagar
      if (locality && locality.toLowerCase() === 'mahadev nagar' && city === 'ahmedabad') {
        svc.image = MAHADEV_NAGAR_IMAGE;
        (svc as any).meta = { ...(row || {}), ['Listing Link']: MAHADEV_NAGAR_LISTING };
      }

      // Odhav
      if (locality && locality.toLowerCase() === 'odhav' && city === 'ahmedabad') {
        svc.image = ODHAV_IMAGE;
        (svc as any).meta = { ...(row || {}), ['Listing Link']: ODHAV_LISTING };
      }

      // Ramol
      if (locality && locality.toLowerCase() === 'ramol' && city === 'ahmedabad') {
        svc.image = RAMOL_IMAGE;
        (svc as any).meta = { ...(row || {}), ['Listing Link']: RAMOL_LISTING };
      }
      return svc as Service;
    } catch (e) {
      return null;
    }
  };

  // Image mappings for common food keywords
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
    // Default fallback image for other food items
    if (name.includes('pepsi')) {
      return foodImageMappings.pepsi;
    }

    if (name.includes('bhajipav') || name.includes('bhaji pav')) {
      return foodImageMappings.bhajipav;
    }
    return 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRAD_kasqlYXaDOWO1rCq96ZJ77o2_3xYy1Tw&s';
  };

  // normalize food CSV (swiggy_Ahm.csv) row to Service-like item
  const mapFoodRow = (row: any, idx: number): Service => {
    const id = `food-${idx}`;
    const price = Number(row['Price (INR)']) || 0;
    const rating = Number(row['Rating']) || 0;
    const ratingCount = Number(row['Rating Count']) || 0;
    const dishName = row['Dish Name'] || 'Unknown Dish';

    return {
      id,
      name: `${dishName} - ${row['Restaurant Name']}`,
      type: 'food',
      city: row['City'] || 'Ahmedabad',
      price: price,
      rating: rating > 0 ? rating : computeNearbyFour(id),
      description: `${row['Category']} dish from ${row['Restaurant Name']} in ${row['Location']}. ${ratingCount > 0 ? `Based on ${ratingCount} ratings.` : ''}`,
      image: getFoodImage(dishName),
      features: [row['Restaurant Name'], row['Location'], row['Category']],
    } as Service;
  };

  useEffect(() => {
  // Reset transient CSV state

    // decide whether to load CSVs depending on selected filters
    const loadCsv = async () => {
      // If no needs selected, treat it as "All Services": load accommodation for the city
      // and food data only when available (Ahmedabad dataset)
      const effectiveTypes = selectedServiceTypes.length === 0
        ? ['accommodation', 'food']
        : selectedServiceTypes;

      setIsLoadingCsv(true);
      setCsvError(null);

      let allItems: Service[] = [];

      try {

        // Load accommodation data if accommodation is selected (or All Services)
        if (effectiveTypes.includes('accommodation')) {
          const cityFile = selectedCity || 'Surat';
          const path = `/data/Accomodation/${cityFile}.csv`;
          console.log(`Attempting to load accommodation data from: ${path}`);
          const res = await fetch(path);
          if (res.ok) {
            const text = await res.text();
            console.log(`Loaded CSV text length: ${text.length} characters for ${cityFile}`);
            const parsed = Papa.parse(text, { header: true, skipEmptyLines: true });
            console.log(`Parsed ${parsed.data?.length || 0} rows from ${cityFile} CSV`);
            const items = (parsed.data || []).map((r: any) => {
              const s = mapAccommodationRow(r);
              if (s) s.meta = r;
              return s;
            }).filter((x: any) => x) as Service[];
            console.log(`Created ${items.length} valid accommodation items for ${cityFile}`);
            allItems.push(...items);
          } else {
            console.warn(`Failed to load ${cityFile} CSV: ${res.status} ${res.statusText}`);
            // Show user-friendly message when city data is not available
            window.dispatchEvent(new CustomEvent('toast:show', {
              detail: { message: `No accommodation data available for ${cityFile}. Try another city.`, type: 'info' }
            }));
          }
        }

        // Load food data if food is selected (or All Services)
        if (effectiveTypes.includes('food')) {
          if (selectedCity && selectedCity !== 'Ahmedabad') {
            try {
              window.dispatchEvent(new CustomEvent('toast:show', {
                detail: { message: `Food data is available only for Ahmedabad right now.`, type: 'info' }
              }));
            } catch {}
          }
          if (selectedCity && selectedCity !== 'Ahmedabad') {
            // Skip loading food CSV for other cities
          } else {
            const path = `/data/Food/swiggy_Ahm.csv`;
            const res = await fetch(path);
            if (res.ok) {
              const text = await res.text();
              const parsed = Papa.parse(text, { header: true, skipEmptyLines: true });
              // ...existing code...
              const allData = parsed.data || [];
              const categoryGroups: Record<string, any[]> = {};
              allData.forEach((item: any) => {
                const category = item['Category'] || 'Other';
                if (!categoryGroups[category]) {
                  categoryGroups[category] = [];
                }
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
              const items = sampledData.map((r: any, i: number) => {
                const s = mapFoodRow(r, i);
                s.meta = r;
                return s;
              });
              allItems.push(...items);
              console.log(`Loaded ${items.length} food items for Ahmedabad`);
            }
          }
        }

        // Load tiffin data if tiffin is selected
        if (effectiveTypes.includes('tiffin')) {
          // Use the correct public path for Vite/React dev server
          const tiffinPath = `/data/Food/tifin_rental.csv`;
          const res = await fetch(tiffinPath);
          if (res.ok) {
            const text = await res.text();
            const parsed = Papa.parse(text, { header: true, skipEmptyLines: true });
            const tiffinData = parsed.data || [];
            // Debug: log city values from tiffin CSV rows
            tiffinData.forEach((row: any, i: number) => {
              console.log(`Tiffin row ${i}: city='${row.City}', lastCol='${row[row.length - 1]}'`);
            });
            // Filter by city if selected (normalize for comparison)
            const filteredTiffin = selectedCity
              ? tiffinData.filter((row: any) => (row.City || row[row.length - 1] || '').trim().toLowerCase() === selectedCity.trim().toLowerCase())
              : tiffinData;
            // Map tifin_rental.csv row to Service
            const mapTiffinRow = (row: any, idx: number): Service => {
              const id = `tiffin-${idx}`;
              const priceStr = row['Estimated_Price_Per_Tiffin_INR'] || '';
              // Try to extract a number from the price range string
              let price = 0;
              const match = priceStr.match(/\d+/g);
              if (match && match.length > 0) price = Number(match[0]);
              const rating = Number(row['Rating']) || computeNearbyFour(id);
              const name = row['Name'] || 'Tiffin Service';
              const city = row['City'] || '';
              const description = `${row['Type'] || 'Tiffin Service'}${row['Address'] ? ' at ' + row['Address'] : ''}`;
              const image = row['Menu'] || 'https://cdn-icons-png.flaticon.com/512/1046/1046857.png';
              return {
                id,
                name,
                type: 'tiffin',
                city,
                price,
                rating,
                description,
                image,
                features: [row['Type'], row['Hours'], row['Phone']].filter(Boolean),
                meta: row,
              } as Service;
            };
            const tiffinItems = filteredTiffin.map((row: any, i: number) => mapTiffinRow(row, i));
            allItems.push(...tiffinItems);
            console.log(`Loaded ${tiffinItems.length} tiffin services for ${selectedCity || 'all cities'}`);
          }
        }

        setCsvServices(allItems.length > 0 ? allItems : null);
        
        // If no CSV data loaded but we have selected needs, ensure mock services are used
        if (allItems.length === 0 && selectedServiceTypes.length > 0) {
          setCsvServices(null); // This will trigger fallback to mockServices in filteredServices
        }
      } catch (err) {
        console.error('Failed to load CSV', err);
        setCsvError('Failed to load data. Please try again.');
        setCsvServices(null);
      } finally {
        setIsLoadingCsv(false);
      }
    };
    loadCsv();
  }, [selectedServiceTypes, selectedCity]);

  // (Optional) Progressive loading function removed as it's currently unused.

  const filteredServices = (csvServices && csvServices.length > 0 ? csvServices : mockServices).filter(service => {
    // If a city is selected, show only that city's data; otherwise allow all cities
    const cityMatch = !selectedCity || (service.city && service.city.toLowerCase() === selectedCity.toLowerCase());
    
    // Debug city filtering
    if (selectedCity && service.city && service.city.toLowerCase() !== selectedCity.toLowerCase()) {
      console.log(`City mismatch: service.city="${service.city}" vs selectedCity="${selectedCity}" for service "${service.name}"`);
    }
    
    // If no needs selected, treat as All Services
    const typeMatch = selectedServiceTypes.length === 0 || selectedServiceTypes.includes(service.type);
    // Fix budget bounds - ensure valid numbers and proper comparison
    const price = Number.isFinite(Number(service.price)) ? Number(service.price) : 0;
    // sanitize inputs
    let minBudgetNum = Number(minBudget);
    let maxBudgetNum = Number(maxBudget);
    if (!Number.isFinite(minBudgetNum) || minBudgetNum < 0) minBudgetNum = 0;
    if (!Number.isFinite(maxBudgetNum) || maxBudgetNum < 0) maxBudgetNum = 0;
    // If user accidentally swapped values, normalize to [low, high]
    if (maxBudgetNum > 0 && minBudgetNum > maxBudgetNum) {
      const tmp = minBudgetNum; minBudgetNum = maxBudgetNum; maxBudgetNum = tmp;
    }
    // 0 = no upper limit
    const budgetMatch = maxBudgetNum === 0
      ? (price >= minBudgetNum)
      : (price >= minBudgetNum && price <= maxBudgetNum);
    
    const termRaw = (searchTerm || '').toString().trim();
    const term = termRaw.toLowerCase();

    // If the user typed a known area name exactly (case-insensitive),
    // restrict results to services that are actually in that area/locality.
    // Otherwise, fall back to the broader fuzzy matching used before.
    let searchMatch = true;
    const isKnownArea = term && normalizedKnownAreas.has(term);
    if (term) {
      if (isKnownArea) {
        // Check area/locality fields specifically for an area match.
        let areaMatch = false;
        const meta = (service as any).meta || {};
        // Common CSV/meta keys that may hold locality/area
        const localityKeys = ['Locality / Area', 'Locality', 'locality', 'Area', 'area'];
        for (const k of localityKeys) {
          const v = meta[k];
          if (!v) continue;
          areaMatch = true;
        }

        // Also allow matching from features (some mock items may include area in features)
        try {
          if ((service.features || []).join(' ').toLowerCase().includes(term)) areaMatch = true;
        } catch (e) { }

        searchMatch = areaMatch;
      } else {
        // broad fuzzy search across name/description/city/features/meta
        const sname = (service.name || '').toLowerCase();
        const sdesc = (service.description || '').toLowerCase();
        const scity = (service.city || '').toLowerCase();
        const nameMatch = sname.includes(term) || sdesc.includes(term) || scity.includes(term);
        const featuresMatch = (service.features || []).join(' ').toLowerCase().includes(term);
        const meta = (service as any).meta || {};
        // scan all meta values for the term
        let metaMatch = false;
        for (const v of Object.values(meta)) {
          if (!v) continue;
          if ((v + '').toString().toLowerCase().includes(term)) { metaMatch = true; break; }
        }
        searchMatch = nameMatch || featuresMatch || metaMatch;
      }
    }

    const finalResult = cityMatch && typeMatch && budgetMatch && searchMatch;
    
    // Double-check budget compliance before returning
    if (finalResult && maxBudgetNum > 0 && price > maxBudgetNum) {
      console.error('🚨 BUDGET FILTER FAILED - FORCING EXCLUSION:', {
        serviceName: service.name,
        price: price,
        maxBudget: maxBudgetNum,
        originalBudgetMatch: budgetMatch
      });
      return false; // Force exclusion
    }
    
    return finalResult;
  });

  // --- Multi-need tabs and sorting ---
  type ActiveTypeTab = 'all' | Service['type'];
  const [activeTypeTab, setActiveTypeTab] = useState<ActiveTypeTab>('all');
  const [sortBy, setSortBy] = useState<'rating' | 'price-asc' | 'price-desc' | 'name'>('rating');

  // Determine which types are present after filters
  const presentTypes: Array<Service['type']> = Array.from(new Set(filteredServices.map(s => s.type))) as Array<Service['type']>;
  // Keep active tab valid
  useEffect(() => {
    if (presentTypes.length === 0) {
      setActiveTypeTab('all');
      return;
    }
    if (activeTypeTab !== 'all' && !presentTypes.includes(activeTypeTab as Service['type'])) {
      setActiveTypeTab('all');
    }
  }, [activeTypeTab, presentTypes.join('|')]);

  // Group counts for header badges
  const typeCounts: Partial<Record<Service['type'], number>> = filteredServices.reduce((acc: Partial<Record<Service['type'], number>>, s) => {
    acc[s.type] = (acc[s.type] || 0) + 1;
    return acc;
  }, {});

  const sortFns = {
    'rating': (a: Service, b: Service) => (displayRating(b) - displayRating(a)) || a.name.localeCompare(b.name),
    'price-asc': (a: Service, b: Service) => (Number.isFinite(a.price) ? a.price : Infinity) - (Number.isFinite(b.price) ? b.price : Infinity) || a.name.localeCompare(b.name),
    'price-desc': (a: Service, b: Service) => (Number.isFinite(b.price) ? b.price : -Infinity) - (Number.isFinite(a.price) ? a.price : -Infinity) || a.name.localeCompare(b.name),
    'name': (a: Service, b: Service) => a.name.localeCompare(b.name)
  } as const;

  const tabFiltered = activeTypeTab === 'all' ? filteredServices : filteredServices.filter(s => {
    const match = s.type === activeTypeTab;
    return match;
  });
  const sortedServices = [...tabFiltered].sort(sortFns[sortBy]);

  // Add/remove bookmark using backend API
  const toggleBookmark = async (serviceId: string) => {
    const token = localStorage.getItem('token');
    const newBookmarked = new Set(bookmarked);
    if (bookmarked.has(serviceId)) {
      // Optimistically update UI
      newBookmarked.delete(serviceId);
      setBookmarked(newBookmarked);
      // persist local bookmark set so UI remains consistent across pages
      try {
        localStorage.setItem('local_bookmarks', JSON.stringify(Array.from(newBookmarked)));
      } catch (e) { }
      // notify other components/pages that bookmarks changed and show feedback even if localStorage fails
      window.dispatchEvent(new CustomEvent('bookmarks:changed'));
      const removedDetail = { message: 'Removed from bookmarks', type: 'success' } as any;
      window.dispatchEvent(new CustomEvent('toast:show', { detail: removedDetail }));

      // If logged in, attempt backend delete using cached bookmark id
      if (token) {
        const bookmarkId = bookmarkIdMap[serviceId];
        if (!bookmarkId) {
          // fallback: try to fetch bookmarks and find id (with timeout)
          try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 2000);
            
            const res = await fetch('/api/bookmarks', { 
              headers: { 'Authorization': `Bearer ${token}` },
              signal: controller.signal
            });
            clearTimeout(timeoutId);
            
            if (res.ok) {
              const data = await res.json();
              const bookmark = (data.bookmarks || []).find((b: any) => b.service_id === serviceId);
              if (bookmark) {
                await fetch(`/api/bookmarks/${bookmark.id}`, { 
                  method: 'DELETE', 
                  headers: { 'Authorization': `Bearer ${token}` },
                  signal: controller.signal
                });
                setBookmarkIdMap((m) => { const next = { ...m }; delete next[serviceId]; return next; });
              }
            }
          } catch (err) {
            console.warn('Failed to remove bookmark from server, keeping local change:', err instanceof Error ? err.message : String(err));
            // Don't revert - the local change is still valid
          }
        } else {
          try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 2000);
            
            const res = await fetch(`/api/bookmarks/${bookmarkId}`, { 
              method: 'DELETE', 
              headers: { 'Authorization': `Bearer ${token}` },
              signal: controller.signal
            });
            clearTimeout(timeoutId);
            
            if (res.ok) {
              setBookmarkIdMap((m) => { const next = { ...m }; delete next[serviceId]; return next; });
            }
          } catch (err) {
            console.warn('Failed to remove bookmark from server, keeping local change:', err instanceof Error ? err.message : String(err));
            // Don't revert - the local change is still valid
          }
        }
      }
    } else {
      // Optimistically add to UI
      newBookmarked.add(serviceId);
      setBookmarked(newBookmarked);
      // persist local bookmark set and the service object so the Bookmarks page can show CSV items
      try {
        localStorage.setItem('local_bookmarks', JSON.stringify(Array.from(newBookmarked)));
        const rawMap = localStorage.getItem('local_bookmark_items');
        const map: Record<string, any> = rawMap ? JSON.parse(rawMap) : {};
        const svc = (csvServices || mockServices).find(s => s.id === serviceId) || mockServices.find(s => s.id === serviceId);
        if (svc) map[serviceId] = svc;
        localStorage.setItem('local_bookmark_items', JSON.stringify(map));
      } catch (e) { }
      // notify other components/pages that bookmarks changed and show feedback even if localStorage fails
      window.dispatchEvent(new CustomEvent('bookmarks:changed'));
      const addedDetail = { message: 'Added to bookmarks', type: 'success' } as any;
      window.dispatchEvent(new CustomEvent('toast:show', { detail: addedDetail }));

      // If logged in, also persist to backend; otherwise keep local-only
      if (token) {
        try {
          const res = await fetch('/api/bookmarks', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ service_id: serviceId })
          });
          if (res.ok) {
            const data = await res.json();
            // backend should return created bookmark record with id
            if (data && data.bookmark && data.bookmark.id) {
              setBookmarkIdMap((m) => ({ ...m, [serviceId]: data.bookmark.id }));
            } else {
              // try to refresh bookmark list
              const r2 = await fetch('/api/bookmarks', { headers: { 'Authorization': `Bearer ${token}` } });
              const d2 = await r2.json();
              const found = (d2.bookmarks || []).find((b: any) => b.service_id === serviceId);
              if (found) setBookmarkIdMap((m) => ({ ...m, [serviceId]: found.id }));
            }
          } else {
            // API call failed but item was already added to UI optimistically
            // Check if it's a network error vs actual failure
            if (res.status === 404 || res.status === 500) {
              // Backend API not available - keep local bookmark but show different message
              console.warn('Backend bookmark API not available, keeping local bookmark');
              window.dispatchEvent(new CustomEvent('toast:show', { detail: { message: 'Added to bookmarks (saved locally)', type: 'success' } }));
            } else {
              // Actual failure - revert optimistic UI
              newBookmarked.delete(serviceId);
              setBookmarked(newBookmarked);
              window.dispatchEvent(new CustomEvent('toast:show', { detail: { message: 'Failed to add bookmark', type: 'error' } }));
            }
          }
        } catch (err) {
          console.error('Failed to add bookmark', err);
          // Check if it's a network error (backend not available)
          if (err instanceof TypeError && err.message.includes('fetch')) {
            // Network error - backend probably not running, keep local bookmark
            console.warn('Backend not available, keeping local bookmark');
            window.dispatchEvent(new CustomEvent('toast:show', { detail: { message: 'Added to bookmarks (saved locally)', type: 'success' } }));
          } else {
            // Other error - revert optimistic UI
            newBookmarked.delete(serviceId);
            setBookmarked(newBookmarked);
            try { localStorage.setItem('local_bookmarks', JSON.stringify(Array.from(newBookmarked))); } catch (e) { }
            window.dispatchEvent(new CustomEvent('toast:show', { detail: { message: 'Failed to add bookmark', type: 'error' } }));
          }
        }
      }
    }
  };

  // Handle food item search with price comparison
  const handleFoodSearch = async () => {
    if (!selectedCity || !foodItem) {
      window.dispatchEvent(new CustomEvent('toast:show', {
        detail: { message: 'Please select a city and enter a food item', type: 'error' }
      }));
      return;
    }

    try {
      // For now, we'll implement a client-side filter since backend endpoint doesn't exist yet
      // This will filter the existing CSV data for the food item
      const filteredResults = csvServices?.filter(service => {
        const dishName = service.name?.toLowerCase() || '';
        const searchFood = foodItem.toLowerCase();
        return dishName.includes(searchFood);
      }) || [];

      if (filteredResults.length === 0) {
        window.dispatchEvent(new CustomEvent('toast:show', {
          detail: { message: `Sorry, ${foodItem} is not available in ${selectedCity}`, type: 'info' }
        }));
        return;
      }

      // Sort by price (lowest first)
      const sortedResults = filteredResults.sort((a, b) => (a.price || 0) - (b.price || 0));

      // Update the display to show only filtered results
      setCsvServices(sortedResults);

      window.dispatchEvent(new CustomEvent('toast:show', {
        detail: {
          message: `Found ${sortedResults.length} options for ${foodItem} in ${selectedCity}. Showing cheapest first!`,
          type: 'success'
        }
      }));

    } catch (error) {
      console.error('Food search error:', error);
      window.dispatchEvent(new CustomEvent('toast:show', {
        detail: { message: 'Failed to search for food items', type: 'error' }
      }));
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-slate-800 mb-2">
          Find Your Perfect City Services
        </h2>
        <p className="text-slate-600">
          Discover accommodation, food, transport, coworking spaces, and utilities
        </p>
      </div>

      {/* Search Filters */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">City</label>
            <select
              value={selectedCity}
              onChange={(e) => {
                const v = e.target.value;
                setSelectedCity(v);
                try { localStorage.setItem('selected_city', v); } catch (err) { }
              }}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Cities</option>
              {cities.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>

          <div className="relative" ref={typesDropdownRef}>
            <label className="block text-sm font-medium text-slate-700 mb-2">Service Types</label>
            <button
              type="button"
              onClick={() => setShowTypesDropdown(s => !s)}
              className="w-full flex items-center justify-between px-3 py-2 border border-slate-300 rounded-lg hover:bg-slate-50"
            >
              <span className="text-sm text-slate-700">
                {selectedServiceTypes.length === 0 ? 'All Services' : `${selectedServiceTypes.length} selected`}
              </span>
              <svg className={`w-4 h-4 transition-transform ${showTypesDropdown ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z" clipRule="evenodd"/></svg>
            </button>
            {showTypesDropdown && (
              <div className="absolute z-50 mt-2 w-full bg-white border border-slate-200 rounded-lg shadow-md p-3 max-h-64 overflow-auto">
                <label className="flex items-center space-x-2 cursor-pointer px-1 py-1 rounded hover:bg-slate-50">
                  <input
                    type="checkbox"
                    checked={selectedServiceTypes.length === 0}
                    onChange={() => {
                      setSelectedServiceTypes([]);
                      setFoodItem('');
                      try { localStorage.setItem('selected_service_types', JSON.stringify([])); } catch {}
                    }}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm">All Services</span>
                </label>
                {serviceTypes.map(type => (
                  <label key={type.id} className="flex items-center space-x-2 cursor-pointer px-1 py-1 rounded hover:bg-slate-50">
                    <input
                      type="checkbox"
                      checked={selectedServiceTypes.includes(type.id)}
                      onChange={(e) => {
                        const isChecked = e.target.checked;
                        let newSelectedTypes: string[];
                        if (isChecked) {
                          newSelectedTypes = [...selectedServiceTypes, type.id];
                        } else {
                          newSelectedTypes = selectedServiceTypes.filter(t => t !== type.id);
                          if (type.id === 'food') setFoodItem('');
                        }
                        setSelectedServiceTypes(newSelectedTypes);
                        try { localStorage.setItem('selected_service_types', JSON.stringify(newSelectedTypes)); } catch {}
                      }}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm">{type.icon} {type.label}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Food Item Input (only when Food selected) */}
          {selectedServiceTypes.includes('food') && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Food Item</label>
              <input
                type="text"
                value={foodItem}
                onChange={(e) => setFoodItem(e.target.value)}
                placeholder="e.g., Burger, Pizza, Biryani"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          )}

          <div className="flex items-end">
            <div className="w-full flex space-x-2">
              {selectedServiceTypes.includes('food') && foodItem ? (
                <button
                  onClick={handleFoodSearch}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-lg font-medium hover:from-green-600 hover:to-blue-700 transition-all flex items-center justify-center space-x-2"
                >
                  <Search className="w-4 h-4" />
                  <span>Find Best Price</span>
                </button>
              ) : (
                <>
                  <input
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      try {
                        localStorage.setItem('search_term', e.target.value);
                      } catch {}
                    }}
                    placeholder="Search by area or name (e.g., Vastral)"
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <div ref={areaButtonRef} className="relative w-full">
                    <button onClick={() => setShowAreaDropdown(s => !s)} className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all flex items-center justify-center space-x-2 w-full">
                      <Search className="w-4 h-4" />
                      <span>Area</span>
                    </button>
                    {showAreaDropdown && (
                      <div className="absolute left-0 mt-2 w-full bg-white border border-slate-200 rounded shadow-lg z-50">
                        <div className="p-2 max-h-60 overflow-auto">
                          {areaOptions.length === 0 ? (
                            <div className="text-slate-400 px-2 py-2">Select a city to see areas</div>
                          ) : (
                            areaOptions.filter(a => a.toLowerCase().includes(searchTerm.toLowerCase())).map((a) => (
                              <button key={a} onClick={() => { 
                                setSearchTerm(a); 
                                setShowAreaDropdown(false); 
                                try {
                                  localStorage.setItem('search_term', a);
                                } catch {}
                              }} className="w-full text-left px-2 py-2 hover:bg-slate-100 rounded">{a}</button>
                            ))
                          )}
                          {areaOptions.length > 0 && areaOptions.filter(a => a.toLowerCase().includes(searchTerm.toLowerCase())).length === 0 && (
                            <div className="text-slate-400 px-2 py-2">No areas found</div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Budget row (always visible) */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-2">Monthly Budget Range</label>
            <div className="flex space-x-2">
              <input
                type="number"
                min={0}
                value={minBudget}
                onChange={e => {
                  const v = Math.max(0, Number(e.target.value) || 0);
                  setMinBudget(v);
                  try {
                    localStorage.setItem('search_min_budget', String(v));
                  } catch {}
                }}
                className="w-1/2 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Min Amount"
              />
              <input
                type="number"
                min={0}
                value={maxBudget}
                onChange={e => {
                  const v = Math.max(0, Number(e.target.value) || 0);
                  setMaxBudget(v);
                  try {
                    localStorage.setItem('search_max_budget', String(v));
                  } catch {}
                }}
                className="w-1/2 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Max Amount"
              />
            </div>
          </div>
        </div>

        {/* Removed old budget slider UI (now handled above with min/max fields) */}
      </div>

      {/* Cost Calculator moved to its own top-level page */}

      {/* Data availability note for Food */}
      {selectedServiceTypes.includes('food') && selectedCity && selectedCity !== 'Ahmedabad' && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-700">
            🍽️ Food dataset is currently available for Ahmedabad only. Switch city to Ahmedabad to see food items.
          </p>
        </div>
      )}

      {/* Results */}
      {selectedServiceTypes.includes('food') && csvServices && csvServices.some(s => s.type === 'food') && (!selectedCity || selectedCity === 'Ahmedabad') && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-700">
            📊 Showing {csvServices.filter(s => s.type === 'food').length} food items from Swiggy Ahmedabad.
            <span className="text-xs text-blue-600 ml-1">
              (Sampled from all categories for variety)
            </span>
          </p>
        </div>
      )}

      {/* Debug info bar */}
      {process.env.NODE_ENV !== 'production' && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-xs">
          <strong>Debug:</strong> City: {selectedCity || 'All'} | 
          Types: {selectedServiceTypes.length === 0 ? 'All' : selectedServiceTypes.join(', ')} | 
          Budget: {minBudget}-{maxBudget} | 
          Active Tab: {activeTypeTab} | 
          Sort: {sortBy} | 
          Filtered: {filteredServices.length} | 
          Tab Filtered: {tabFiltered.length} | 
          Sorted: {sortedServices.length}
        </div>
      )}

      {/* Tabs + Sorting when multiple needs */}
      {!isLoadingCsv && !csvError && presentTypes.length > 0 && (
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              className={`px-3 py-1 rounded-full text-sm ${activeTypeTab === 'all' ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-700'}`}
              onClick={() => setActiveTypeTab('all')}
            >
              All <span className="ml-1 bg-white/70 text-orange-900 px-2 py-0.5 rounded-full text-xs">{filteredServices.length}</span>
            </button>
            {serviceTypes
              .filter(t => presentTypes.includes(t.id as Service['type']))
              .map(t => (
                <button
                  key={t.id}
                  className={`px-3 py-1 rounded-full text-sm ${activeTypeTab === t.id ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-700'}`}
                  onClick={() => setActiveTypeTab(t.id as Service['type'])}
                >
                  <span className="mr-1">{t.icon}</span>{t.label}
                  <span className="ml-1 bg-white/70 text-orange-900 px-2 py-0.5 rounded-full text-xs">{typeCounts[t.id as Service['type']] || 0}</span>
                </button>
              ))}
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-slate-600">Sort by</label>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="px-2 py-1 border border-slate-300 rounded"
            >
              <option value="rating">Rating</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="name">Name</option>
            </select>
          </div>
        </div>
      )}

      {isLoadingCsv ? (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <h3 className="text-lg font-medium text-slate-700 mb-2">Loading food data...</h3>
          <p className="text-slate-500 text-center">Please wait while we fetch the latest restaurant information</p>
        </div>
      ) : csvError ? (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h3 className="text-lg font-medium text-red-700 mb-2">Error Loading Data</h3>
          <p className="text-red-600 text-center">{csvError}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedServices.map((service) => (
            <div key={service.id} className="bg-white rounded-xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
              <div className="relative">
                <img
                  src={service.image}
                  alt={service.name}
                  className="w-full h-48 object-cover"
                />
                <button
                  onClick={() => toggleBookmark(service.id)}
                  className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors"
                >
                  {bookmarked.has(service.id) ? (
                    <BookmarkCheck className="w-4 h-4 text-blue-600" />
                  ) : (
                    <Bookmark className="w-4 h-4 text-slate-600" />
                  )}
                </button>
                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-medium">
                  {service.type === 'food' && csvServices && csvServices.includes(service) ? (
                    <>🍽️ Swiggy</>
                  ) : (
                    <>
                      {serviceTypes.find(t => t.id === service.type)?.icon} {serviceTypes.find(t => t.id === service.type)?.label}
                    </>
                  )}
                </div>
              </div>

              <div className="p-4 flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold text-slate-800">{service.name}</h3>
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-sm text-slate-600">{displayRating(service)}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 mb-2">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  <span className="text-sm text-slate-600">{service.city}</span>
                </div>

                <p className="text-slate-600 text-sm mb-3">{service.description}</p>

                <div className="flex flex-wrap gap-1 mb-3">
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

                <div className="flex items-center justify-between mt-auto">
                  <div className="flex items-center space-x-1">
                    <span className="text-lg font-bold text-slate-800">₹{service.price.toLocaleString()}</span>
                    {service.type !== 'food' && <span className="text-sm text-slate-600">/month</span>}
                  </div>
                  <button onClick={() => setSelected(service)} className="bg-blue-50 text-blue-600 px-3 py-1 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors">
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}

          {filteredServices.length === 0 && !isLoadingCsv && !csvError && (
            <div className="col-span-full text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-slate-800 mb-2">No services found</h3>
              <p className="text-slate-600">Try adjusting your filters to find more options</p>
            </div>
          )}
        </div>
      )}

      <ServiceDetails service={selected} onClose={() => setSelected(null)} />
    </div>
  );
};