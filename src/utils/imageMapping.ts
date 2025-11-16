// Food image mappings for common food keywords
const foodImageMappings: { [key: string]: string[] } = {
  pizza: [
    'https://images.pexels.com/photos/708587/pexels-photo-708587.jpeg?auto=compress&cs=tinysrgb&w=400',
    'https://images.pexels.com/photos/2147491/pexels-photo-2147491.jpeg?auto=compress&cs=tinysrgb&w=400',
    'https://images.pexels.com/photos/825661/pexels-photo-825661.jpeg?auto=compress&cs=tinysrgb&w=400',
  ],
  burger: [
    'https://images.pexels.com/photos/1639557/pexels-photo-1639557.jpeg?auto=compress&cs=tinysrgb&w=400',
    'https://images.pexels.com/photos/1556698/pexels-photo-1556698.jpeg?auto=compress&cs=tinysrgb&w=400',
  ],
  chicken: [
    'https://images.pexels.com/photos/2673353/pexels-photo-2673353.jpeg?auto=compress&cs=tinysrgb&w=400',
    'https://images.pexels.com/photos/2741461/pexels-photo-2741461.jpeg?auto=compress&cs=tinysrgb&w=400',
  ],
  roll: [
    'https://recipesblob.oetker.in/assets/b777acee3b1b47299ae7f47715e926fd/1272x764/roti-roll.webp',
    'https://www.cubesnjuliennes.com/wp-content/uploads/2021/01/Spring-Roll-Recipe.jpg',
  ],
  fries: [
    'https://images.pexels.com/photos/1893556/pexels-photo-1893556.jpeg?auto=compress&cs=tinysrgb&w=400',
  ],
  pasta: [
    'https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg?auto=compress&cs=tinysrgb&w=400',
  ],
  paneer: [
    'https://images.pexels.com/photos/2474658/pexels-photo-2474658.jpeg?auto=compress&cs=tinysrgb&w=400',
  ],
  shake: [
    'https://www.indianhealthyrecipes.com/wp-content/uploads/2021/04/mango-milkshake-recipe.jpg',
  ],
};

const defaultFoodImages = [
  'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400',
  'https://images.pexels.com/photos/1199957/pexels-photo-1199957.jpeg?auto=compress&cs=tinysrgb&w=400',
];

const accommodationImages = [
  'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=400',
  'https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg?auto=compress&cs=tinysrgb&w=400',
  'https://images.pexels.com/photos/2102587/pexels-photo-2102587.jpeg?auto=compress&cs=tinysrgb&w=400',
];

const tiffinImages = [
  'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400',
  'https://images.pexels.com/photos/1092730/pexels-photo-1092730.jpeg?auto=compress&cs=tinysrgb&w=400',
];

const getRandomImageFromCategory = (images: string[]): string => {
  if (!images || images.length === 0) return defaultFoodImages[0];
  return images[Math.floor(Math.random() * images.length)];
};

export const getFoodImage = (dishName: string): string => {
  const name = dishName.toLowerCase();

  if (name.includes('pizza')) {
    return getRandomImageFromCategory(foodImageMappings.pizza);
  }
  if (name.includes('roll') || name.includes('wrap') || name.includes('kathi')) {
    return getRandomImageFromCategory(foodImageMappings.roll);
  }
  if (name.includes('burger')) {
    return getRandomImageFromCategory(foodImageMappings.burger);
  }
  if (name.includes('chicken') || name.includes('tikka')) {
    return getRandomImageFromCategory(foodImageMappings.chicken);
  }
  if (name.includes('fries') || name.includes('fry')) {
    return getRandomImageFromCategory(foodImageMappings.fries);
  }
  if (name.includes('shake') || name.includes('smoothie') || name.includes('milkshake')) {
    return getRandomImageFromCategory(foodImageMappings.shake);
  }
  if (name.includes('pasta') || name.includes('penne') || name.includes('spaghetti')) {
    return getRandomImageFromCategory(foodImageMappings.pasta);
  }
  if (name.includes('paneer') || name.includes('cottage cheese')) {
    return getRandomImageFromCategory(foodImageMappings.paneer);
  }

  return getRandomImageFromCategory(defaultFoodImages);
};

export const getServiceImage = (category: string, name: string): string => {
  const categoryLower = category.toLowerCase();
  
  if (categoryLower === 'food') {
    return getFoodImage(name);
  }
  
  if (categoryLower === 'accommodation') {
    return getRandomImageFromCategory(accommodationImages);
  }
  
  if (categoryLower === 'tiffin') {
    return getRandomImageFromCategory(tiffinImages);
  }
  
  // Default fallback
  return defaultFoodImages[0];
};
