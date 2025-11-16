import { supabase } from '../config/supabase';
import { Service } from '../data/mockServices';

export const loadServicesFromDatabase = async (): Promise<Service[]> => {
  try {
    const { data, error } = await supabase
      .from('services')
      .select('*');

    if (error) {
      console.error('Error loading services from database:', error);
      return [];
    }

    // Convert database services to Service format
    const services: Service[] = (data || []).map((item: any) => ({
      id: item.id,
      name: item.name,
      type: item.type,
      city: item.city,
      area: item.area,
      price: item.price || 0,
      rating: item.rating || 0,
      description: item.description,
      address: item.address,
      contact: item.contact,
      email: item.email,
      website: item.website,
      amenities: item.amenities || [],
      image: item.image,
      features: item.amenities || [],
      meta: item
    }));

    console.log('Loaded services from database:', services.length);
    return services;
  } catch (error) {
    console.error('Failed to load services from database:', error);
    return [];
  }
};

export const subscribeToServicesChanges = (callback: () => void) => {
  const channel = supabase
    .channel('services_changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'services' }, () => {
      callback();
    })
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};
