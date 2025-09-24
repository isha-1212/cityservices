export interface Service {
    id: string;
    name: string;
    type: 'accommodation' | 'food' | 'tiffin' | 'transport' | 'coworking' | 'utilities';
    city: string;
    price: number;
    rating: number;
    description: string;
    image: string;
    features: string[];
    // optional raw/meta fields (used when loading from CSVs so we can display all original columns)
    meta?: Record<string, string>;
}

export const mockServices: Service[] = [
    {
        id: '1',
        name: 'Premium Co-living Space Ahmedabad',
        type: 'accommodation',
        city: 'Ahmedabad',
        price: 12000,
        rating: 4.5,
        description: 'Fully furnished shared apartment with all amenities in Ahmedabad',
        image: 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=400',
        features: ['WiFi', 'AC', 'Laundry', 'Kitchen', 'Security']
    },
    {
        id: '2',
        name: 'Healthy Meal Plans Surat',
        type: 'food',
        city: 'Surat',
        price: 4000,
        rating: 4.6,
        description: 'Fresh, healthy meals delivered daily to your doorstep in Surat',
        image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400',
        features: ['Daily Delivery', 'Customizable', 'Fresh Ingredients']
    },
    {
        id: '3',
        name: 'Family Suite Vadodara',
        type: 'accommodation',
        city: 'Vadodara',
        price: 15000,
        rating: 4.4,
        description: 'Spacious family suite with modern amenities in Vadodara',
        image: 'https://images.pexels.com/photos/2029667/pexels-photo-2029667.jpeg?auto=compress&cs=tinysrgb&w=400',
        features: ['Furnished', 'Parking', 'Gym Access', '24/7 Support']
    },
    {
        id: '4',
        name: 'Local Tiffin Service Rajkot',
        type: 'food',
        city: 'Rajkot',
        price: 3000,
        rating: 4.2,
        description: 'Home-cooked tiffin plans delivered in Rajkot',
        image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400',
        features: ['Home-cooked', 'Daily Delivery', 'Affordable']
    },
    {
        id: '5',
        name: 'Studio Apartment Gandhinagar',
        type: 'accommodation',
        city: 'Gandhinagar',
        price: 10000,
        rating: 4.3,
        description: 'Compact studio apartment near major transit in Gandhinagar',
        image: 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=400',
        features: ['Furnished', 'Close to Transit', 'High-speed Internet']
    }
];

export default mockServices;