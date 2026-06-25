const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const Product = require('../models/Product');
const Category = require('../models/Category');

const productsData = [
  {
    sku: "rose-petal-honey",
    name: "Rose Petal Honey",
    category: "honey",
    price: 399,
    weight: 250,
    images: ["assets/images/rose_petal_honey.png"],
    description: "Infused with organic rose petals, this pure honey offers a sweet, floral aroma and a rich, natural flavor. Perfect for boosting immunity and soothing throats.",
    stock: 50,
    featured: true,
    isActive: true
  },
  {
    sku: "ginger-honey",
    name: "Ginger Honey",
    category: "honey",
    price: 349,
    weight: 250,
    images: ["assets/images/ginger_honey.png"],
    description: "A warming blend of raw honey and spicy ginger. An ancient grandmother's remedy for cold, cough, and digestive health.",
    stock: 75,
    featured: true,
    isActive: true
  },
  {
    sku: "dry-fruits-honey",
    name: "Dry Fruits Honey",
    category: "honey",
    price: 499,
    weight: 250,
    images: ["assets/images/dry_fruits_honey.png"],
    description: "Premium almonds, cashews, and walnuts drenched in pure wild honey. A delicious power pack of energy and nutrition.",
    stock: 40,
    featured: false,
    isActive: true
  },
  {
    sku: "wild-honey-black-forest",
    name: "Wild Honey (Black Forest)",
    category: "honey",
    price: 599,
    weight: 250,
    images: ["assets/images/wild_honey.png"],
    description: "Exquisite dark honey harvested from wild bumble bees in the deep forests. Highly potent, thick, and rich in mineral content.",
    stock: 30,
    featured: true,
    isActive: true
  },
  {
    sku: "oal-ka-achar",
    name: "Oal Ka Achar (Jimikand/Elephant Yam)",
    category: "pickles",
    price: 249,
    weight: 400,
    images: ["assets/images/oal_pickle.png"],
    description: "Traditional Bihari-style Jimikand (Elephant Foot Yam) pickle. Grated and seasoned with mustard oil, lemon juice, and hand-ground spices.",
    stock: 60,
    featured: false,
    isActive: true
  },
  {
    sku: "kathal-ka-achar",
    name: "Kathal Ka Achar (Jackfruit Pickle)",
    category: "pickles",
    price: 279,
    weight: 400,
    images: ["assets/images/kathal_pickle.png"],
    description: "Tender jackfruit pieces cured in aromatic spices and pure cold-pressed mustard oil. A savory delight that mimics a rich texture.",
    stock: 80,
    featured: true,
    isActive: true
  },
  {
    sku: "amla-ka-achar",
    name: "Amla Ka Achar (Indian Gooseberry)",
    category: "pickles",
    price: 199,
    weight: 400,
    images: ["assets/images/amla_pickle.png"],
    description: "Tangy and spicy gooseberry pickle packed with Vitamin C. Made with fresh, plump amlas and healthy spices.",
    stock: 120,
    featured: false,
    isActive: true
  },
  {
    sku: "jamun-ka-sirka",
    name: "Jamun Ka Sirka (Black Plum Vinegar)",
    category: "sirka",
    price: 299,
    weight: 500,
    images: ["assets/images/jamun_sirka.png"],
    description: "100% natural, brewed jamun vinegar. Excellent for blood sugar management, digestion, and urinary system health.",
    stock: 90,
    featured: true,
    isActive: true
  },
  {
    sku: "mango-mint-chutney",
    name: "Premium Mango Mint Chutney",
    category: "chutneys",
    price: 149,
    weight: 250,
    images: ["assets/images/mango_mint_chutney.png"],
    description: "A refreshing blend of raw green mangoes, fresh garden mint, green chilies, and hand-selected spices.",
    stock: 110,
    featured: false,
    isActive: true
  },
  {
    sku: "spicy-garlic-chutney",
    name: "Spicy Garlic Tomato Chutney",
    category: "chutneys",
    price: 149,
    weight: 250,
    images: ["assets/images/garlic_tomato_chutney.png"],
    description: "A fiery red chutney packed with slow-roasted garlic cloves, vine-ripened tomatoes, and dried red chilies.",
    stock: 95,
    featured: false,
    isActive: true
  },
  {
    sku: "paneer-butter-masala",
    name: "Ready-To-Eat Paneer Butter Masala",
    category: "ready-to-eat",
    price: 219,
    weight: 300,
    images: ["assets/images/paneer_butter_masala.png"],
    description: "Rich and creamy cottage cheese cubes cooked in a buttery tomato-onion gravy with aromatic spices. Preserved using retort technology without chemicals.",
    stock: 45,
    featured: false,
    isActive: true
  },
  {
    sku: "dal-makhani",
    name: "Ready-To-Eat Dal Makhani",
    category: "ready-to-eat",
    price: 189,
    weight: 300,
    images: ["assets/images/dal_makhani.png"],
    description: "Black lentils and red kidney beans slow-cooked overnight with fresh cream, butter, and spices. Rich, smoky, and comforting.",
    stock: 70,
    featured: true,
    isActive: true
  },
  {
    sku: "veggie-spring-rolls",
    name: "Frozen Veggie Spring Rolls",
    category: "frozen-snacks",
    price: 249,
    weight: 400,
    images: ["assets/images/veggie_spring_rolls.png"],
    description: "Crispy, golden pastry sheets packed with finely shredded vegetables, glass noodles, and Asian seasonings. Freeze-locked freshness.",
    stock: 35,
    featured: false,
    isActive: true
  },
  {
    sku: "crispy-potato-bites",
    name: "Frozen Crispy Potato Bites",
    category: "frozen-snacks",
    price: 199,
    weight: 400,
    images: ["assets/images/potato_bites.png"],
    description: "Mouth-watering potato nuggets seasoned with garlic, herbs, and mild chili. Crispy on the outside, fluffy inside.",
    stock: 65,
    featured: false,
    isActive: true
  },
  {
    sku: "breakfast-honey-combo",
    name: "Breakfast Honey Combo",
    category: "combos",
    price: 699,
    weight: 500,
    images: ["assets/images/honey_combo.png"],
    description: "Start your morning healthy with our best-selling honeys. Includes Rose Petal Honey (250g) and Ginger Honey (250g). Saves 22%!",
    stock: 25,
    featured: true,
    isActive: true
  },
  {
    sku: "traditional-pickle-combo",
    name: "Traditional Pickle Combo",
    category: "combos",
    price: 649,
    weight: 1200,
    images: ["assets/images/pickle_combo.png"],
    description: "The ultimate Indian pickle package. Includes Oal (Yam) Pickle (400g), Kathal (Jackfruit) Pickle (400g), and Amla (Gooseberry) Pickle (400g).",
    stock: 15,
    featured: true,
    isActive: true
  },
  {
    sku: "complete-immunity-pack",
    name: "Complete Immunity Pack",
    category: "combos",
    price: 949,
    weight: 1150,
    images: ["assets/images/immunity_combo.png"],
    description: "Supercharge your family's health. Combines Wild Honey (250g), Amla Pickle (400g), and Jamun ka Sirka (500ml). Highly recommended by customers.",
    stock: 20,
    featured: true,
    isActive: true
  },
  {
    sku: "gourmet-gift-box",
    name: "Gourmet Gift Box",
    category: "gift-packs",
    price: 899,
    weight: 900,
    images: ["assets/images/gift_box.png"],
    description: "Share the taste of wellness with your loved ones. Beautifully packed gift box containing Dry Fruits Honey (250g), Kathal Pickle (400g), and Mango Mint Chutney (250g).",
    stock: 18,
    featured: true,
    isActive: true
  }
];

const seedDB = async () => {
  try {
    const connStr = process.env.MONGODB_URI;
    if (!connStr) {
      throw new Error('MONGODB_URI is not defined in backend/.env');
    }

    console.log('Connecting to database...');
    await mongoose.connect(connStr);
    console.log('Connected to MongoDB.');

    // 1. Clear existing collections
    console.log('Clearing existing products and categories...');
    await Product.deleteMany({});
    await Category.deleteMany({});

    // 2. Extract and insert unique categories
    const categoryNames = [...new Set(productsData.map(p => p.category))];
    console.log(`Inserting ${categoryNames.length} categories...`);
    
    const categoriesMap = {};
    for (const name of categoryNames) {
      const cat = await Category.create({
        name: name,
        description: `Premium organic ${name} products from Mamafarm`,
        image: `assets/images/category_${name}.png`,
        isActive: true
      });
      categoriesMap[name] = cat._id;
    }
    console.log('Categories seeded.');

    // 3. Map categories to products and insert
    console.log('Mapping categories and seeding products...');
    const productsToInsert = productsData.map(p => ({
      ...p,
      category: categoriesMap[p.category]
    }));

    await Product.insertMany(productsToInsert);
    console.log('Products seeded successfully.');

    mongoose.connection.close();
    console.log('Database connection closed.');
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedDB();
