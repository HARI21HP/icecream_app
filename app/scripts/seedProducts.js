// Script to seed ice cream products to Firestore
import { collection, addDoc, setDoc, doc } from 'firebase/firestore';
import { db } from '../config/firebase';

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
    imageUrl: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400',
    variants: ['250g', '500g', '1L'],
    ingredients: ['Milk', 'Cream', 'Sugar', 'Vanilla Extract'],
  },
  {
    id: '2',
    name: 'Chocolate Ice Cream',
    description: 'Rich and indulgent chocolate ice cream made with premium cocoa. A chocolate lover\'s dream come true.',
    price: 150,
    category: 'Classic',
    inStock: true,
    rating: 4.7,
    reviews: 245,
    imageUrl: 'https://images.unsplash.com/photo-1570197788417-0e82375c9371?w=400',
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
    imageUrl: 'https://images.unsplash.com/photo-1501443762994-82bd5dace89a?w=400',
    variants: ['250g', '500g', '1L'],
    ingredients: ['Milk', 'Cream', 'Sugar', 'Fresh Strawberries'],
  },
  {
    id: '4',
    name: 'Mint Chocolate Chip',
    description: 'Cool mint ice cream with rich chocolate chips. The perfect balance of refreshing mint and sweet chocolate.',
    price: 160,
    category: 'Premium',
    inStock: true,
    rating: 4.6,
    reviews: 189,
    imageUrl: 'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=400',
    variants: ['250g', '500g', '1L'],
    ingredients: ['Milk', 'Cream', 'Sugar', 'Peppermint Extract', 'Chocolate Chips'],
  },
  {
    id: '5',
    name: 'Butter Pecan',
    description: 'Creamy butter-flavored ice cream with roasted pecans. A Southern classic with a nutty twist.',
    price: 170,
    category: 'Premium',
    inStock: true,
    rating: 4.3,
    reviews: 94,
    imageUrl: 'https://images.unsplash.com/photo-1560008581-09826d1de69e?w=400',
    variants: ['250g', '500g', '1L'],
    ingredients: ['Milk', 'Cream', 'Sugar', 'Butter', 'Roasted Pecans'],
  },
  {
    id: '6',
    name: 'Cookies & Cream',
    description: 'Vanilla ice cream loaded with crushed chocolate sandwich cookies. A crowd favorite!',
    price: 155,
    category: 'Popular',
    inStock: true,
    rating: 4.8,
    reviews: 312,
    imageUrl: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=400',
    variants: ['250g', '500g', '1L'],
    ingredients: ['Milk', 'Cream', 'Sugar', 'Vanilla Extract', 'Oreo Cookies'],
  },
  {
    id: '7',
    name: 'Mango Sorbet',
    description: 'Dairy-free tropical mango sorbet made with real Alfonso mangoes. Light, refreshing, and vegan-friendly.',
    price: 130,
    category: 'Sorbet',
    inStock: true,
    rating: 4.5,
    reviews: 167,
    imageUrl: 'https://images.unsplash.com/photo-1562059392-096320bccc7e?w=400',
    variants: ['250g', '500g'],
    ingredients: ['Fresh Mango Pulp', 'Sugar', 'Lemon Juice', 'Water'],
  },
  {
    id: '8',
    name: 'Pistachio Ice Cream',
    description: 'Premium pistachio ice cream with real California pistachios. Rich, nutty, and absolutely divine.',
    price: 165,
    category: 'Premium',
    inStock: true,
    rating: 4.4,
    reviews: 143,
    imageUrl: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=400',
    variants: ['250g', '500g', '1L'],
    ingredients: ['Milk', 'Cream', 'Sugar', 'Pistachio Paste', 'Roasted Pistachios'],
  },
  {
    id: '9',
    name: 'Coffee Ice Cream',
    description: 'Bold coffee-flavored ice cream made with premium Arabica beans. Perfect for coffee enthusiasts.',
    price: 150,
    category: 'Classic',
    inStock: false,
    rating: 4.2,
    reviews: 76,
    imageUrl: 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=400',
    variants: ['250g', '500g', '1L'],
    ingredients: ['Milk', 'Cream', 'Sugar', 'Coffee Extract', 'Espresso'],
  },
  {
    id: '10',
    name: 'Salted Caramel',
    description: 'Sweet and salty caramel ice cream with ribbons of salted caramel sauce. A perfect balance of flavors.',
    price: 175,
    category: 'Premium',
    inStock: true,
    rating: 4.9,
    reviews: 421,
    imageUrl: 'https://images.unsplash.com/photo-1571506165871-ee72a35bc9d4?w=400',
    variants: ['250g', '500g', '1L'],
    ingredients: ['Milk', 'Cream', 'Sugar', 'Caramel', 'Sea Salt'],
  },
  {
    id: '11',
    name: 'Rocky Road',
    description: 'Chocolate ice cream with marshmallows, almonds, and chocolate chunks. A classic American favorite.',
    price: 165,
    category: 'Popular',
    inStock: true,
    rating: 4.6,
    reviews: 203,
    imageUrl: 'https://images.unsplash.com/photo-1567206563064-6f60f40a2b57?w=400',
    variants: ['250g', '500g', '1L'],
    ingredients: ['Milk', 'Cream', 'Cocoa', 'Marshmallows', 'Almonds', 'Chocolate Chunks'],
  },
  {
    id: '12',
    name: 'Raspberry Ripple',
    description: 'Creamy vanilla ice cream swirled with tangy raspberry sauce. Fruity and refreshing.',
    price: 145,
    category: 'Fruit',
    inStock: true,
    rating: 4.3,
    reviews: 112,
    imageUrl: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400',
    variants: ['250g', '500g', '1L'],
    ingredients: ['Milk', 'Cream', 'Sugar', 'Vanilla', 'Raspberry Sauce'],
  },
];

export const seedProducts = async () => {
  try {
    console.log('🌱 Starting to seed products to Firestore...');
    
    const productsCollection = collection(db, 'products');
    
    for (const product of iceCreamProducts) {
      // Use the product id as the document id
      const productRef = doc(db, 'products', product.id);
      await setDoc(productRef, {
        ...product,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      console.log(`✓ Added: ${product.name}`);
    }
    
    console.log('✅ All products seeded successfully!');
    console.log(`📦 Total products: ${iceCreamProducts.length}`);
    return { success: true, count: iceCreamProducts.length };
  } catch (error) {
    console.error('❌ Error seeding products:', error);
    return { success: false, error: error.message };
  }
};

// Export products data for use in other parts of the app
export { iceCreamProducts };
