// Script to seed ice cream products to Firestore
import { collection, addDoc, setDoc, doc } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';

const iceCreamProducts = [
  {
    id: '1',
    name: 'Vanilla Ice Cream',
    description: 'Classic creamy vanilla ice cream made with real Madagascar vanilla beans. Smooth, rich, and perfect for any occasion.',
    price: 120,
    category: 'Classic',
    inStock: true,
    rating: 4.5,
    reviews: 128,
    imageUrl: 'vanilla',
    variants: ['250g', '500g', '1L'],
    ingredients: ['Milk', 'Cream', 'Sugar', 'Vanilla Extract'],
  },
  {
    id: '2',
    name: 'Rich Chocolate Ice Cream',
    description: 'Rich and indulgent chocolate ice cream made with premium cocoa. A chocolate lover\'s dream come true.',
    price: 150,
    category: 'Classic',
    inStock: true,
    rating: 4.7,
    reviews: 245,
    imageUrl: 'chocolate',
    variants: ['250g', '500g', '1L'],
    ingredients: ['Milk', 'Cream', 'Sugar', 'Cocoa Powder', 'Dark Chocolate'],
  },
  {
    id: '3',
    name: 'Strawberry Ice Cream',
    description: 'Fresh strawberry ice cream bursting with real fruit chunks. Sweet, fruity, and refreshing.',
    price: 140,
    category: 'Fruit',
    inStock: true,
    rating: 4.4,
    reviews: 156,
    imageUrl: 'strawberry',
    variants: ['250g', '500g', '1L'],
    ingredients: ['Milk', 'Cream', 'Sugar', 'Fresh Strawberries'],
  },
  {
    id: '4',
    name: 'Alphonso Mango Ice Cream',
    description: 'Premium Alphonso mango ice cream made with real mango pulp. The king of fruits meets the queen of desserts!',
    price: 160,
    category: 'Fruit',
    inStock: true,
    rating: 4.8,
    reviews: 289,
    imageUrl: 'alphonsoMango',
    variants: ['250g', '500g', '1L'],
    ingredients: ['Milk', 'Cream', 'Sugar', 'Alphonso Mango Pulp'],
  },
  {
    id: '5',
    name: 'Butterscotch Ice Cream',
    description: 'Creamy butterscotch ice cream with caramelized sugar bits. A sweet, buttery delight!',
    price: 145,
    category: 'Classic',
    inStock: true,
    rating: 4.6,
    reviews: 194,
    imageUrl: 'butterscotch',
    variants: ['250g', '500g', '1L'],
    ingredients: ['Milk', 'Cream', 'Sugar', 'Butter', 'Butterscotch Chips'],
  },
  {
    id: '6',
    name: 'Pistachio Ice Cream',
    description: 'Premium pistachio ice cream with real California pistachios. Rich, nutty, and absolutely divine.',
    price: 180,
    category: 'Premium',
    inStock: true,
    rating: 4.7,
    reviews: 167,
    imageUrl: 'pistachio',
    variants: ['250g', '500g', '1L'],
    ingredients: ['Milk', 'Cream', 'Sugar', 'Pistachio Paste', 'Roasted Pistachios'],
  },
  {
    id: '7',
    name: 'Arabian Delight Ice Cream',
    description: 'Exotic Arabian-inspired ice cream with dates, saffron, and cardamom. A luxurious Middle Eastern treat.',
    price: 200,
    category: 'Premium',
    inStock: true,
    rating: 4.9,
    reviews: 123,
    imageUrl: 'arabianDelight',
    variants: ['250g', '500g'],
    ingredients: ['Milk', 'Cream', 'Sugar', 'Dates', 'Saffron', 'Cardamom'],
  },
  {
    id: '8',
    name: 'Jackfruit Ice Cream',
    description: 'Unique jackfruit ice cream with real fruit pieces. A tropical delicacy that\'s sweet and aromatic.',
    price: 165,
    category: 'Fruit',
    inStock: true,
    rating: 4.5,
    reviews: 143,
    imageUrl: 'jackfruit',
    variants: ['250g', '500g', '1L'],
    ingredients: ['Milk', 'Cream', 'Sugar', 'Fresh Jackfruit', 'Vanilla'],
  },
  {
    id: '9',
    name: 'Passion Fruit Ice Cream',
    description: 'Tangy and refreshing passion fruit ice cream. Tropical flavors that burst in your mouth!',
    price: 155,
    category: 'Fruit',
    inStock: true,
    rating: 4.6,
    reviews: 198,
    imageUrl: 'passionFruit',
    variants: ['250g', '500g', '1L'],
    ingredients: ['Milk', 'Cream', 'Sugar', 'Passion Fruit Pulp', 'Lemon'],
  },
  {
    id: '10',
    name: 'Pineapple Ice Cream',
    description: 'Sweet and tangy pineapple ice cream with chunks of fresh pineapple. A tropical paradise in every bite!',
    price: 140,
    category: 'Fruit',
    inStock: true,
    rating: 4.4,
    reviews: 176,
    imageUrl: 'pineapple',
    variants: ['250g', '500g', '1L'],
    ingredients: ['Milk', 'Cream', 'Sugar', 'Fresh Pineapple', 'Lime Zest'],
  },
  {
    id: '11',
    name: 'Sweet Orange Ice Cream',
    description: 'Refreshing orange ice cream made with fresh citrus. Tangy, sweet, and perfectly balanced!',
    price: 135,
    category: 'Fruit',
    inStock: true,
    rating: 4.5,
    reviews: 203,
    imageUrl: 'sweetOrange',
    variants: ['250g', '500g', '1L'],
    ingredients: ['Milk', 'Cream', 'Sugar', 'Fresh Orange Juice', 'Orange Zest'],
  },
  {
    id: '12',
    name: 'Tender Coconut Ice Cream',
    description: 'Creamy coconut ice cream with tender coconut pieces. A tropical delight that\'s smooth and refreshing.',
    price: 145,
    category: 'Fruit',
    inStock: true,
    rating: 4.7,
    reviews: 189,
    imageUrl: 'tenderCoconut',
    variants: ['250g', '500g', '1L'],
    ingredients: ['Milk', 'Cream', 'Sugar', 'Tender Coconut', 'Coconut Water'],
  },
];

export const seedProducts = async () => {
  try {

    const productsCollection = collection(db, 'products');
    
    for (const product of iceCreamProducts) {
      // Use the product id as the document id
      const productRef = doc(db, 'products', product.id);
      await setDoc(productRef, {
        ...product,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

    }


    return { success: true, count: iceCreamProducts.length };
  } catch (error) {
    console.error('❌ Error seeding products:', error);
    return { success: false, error: error.message };
  }
};

// Export products data for use in other parts of the app
export { iceCreamProducts };
