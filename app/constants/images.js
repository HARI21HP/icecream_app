// Local Image Assets Mapping
// This file provides easy access to all local ice cream images

export const IMAGES = {
  // Ice Cream Product Images
  vanilla: require('../../assets/Vanilla.jpg'),
  chocolate: require('../../assets/Rich-Chocolate.jpg'),
  strawberry: require('../../assets/Strawberry.jpg'),
  alphonsoMango: require('../../assets/Alphonso-Mango.jpg'),
  butterscotch: require('../../assets/Butterscotch.jpg'),
  pistachio: require('../../assets/Pistachio.jpg'),
  arabianDelight: require('../../assets/Arabian delight.jpg'),
  jackfruit: require('../../assets/Jackfruit_1.jpg'),
  passionFruit: require('../../assets/Passion-Fruit.jpg'),
  pineapple: require('../../assets/Pineapple.jpg'),
  sweetOrange: require('../../assets/Sweet-Orange.jpg'),
  tenderCoconut: require('../../assets/Tender-Coconut_1.jpg'),
  
  // UI Images
  placeholder: require('../../assets/placeholder.png'),
  icecream: require('../../assets/icecream.png'),
  banner1: require('../../assets/Banner1.png'),
};

// Get image source from URL or local asset
export const getImageSource = (imageUrl) => {
  // If it's already a local require() object
  if (typeof imageUrl === 'number') {
    return imageUrl;
  }
  
  // If it's a URL string
  if (typeof imageUrl === 'string') {
    // Check if it's a web URL
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return { uri: imageUrl };
    }
    
    // If it's a key from IMAGES object
    if (IMAGES[imageUrl]) {
      return IMAGES[imageUrl];
    }
  }
  
  // Default placeholder
  return IMAGES.placeholder;
};

export default IMAGES;
