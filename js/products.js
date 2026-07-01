const products = [
  {
    id: "rose-petal-honey",
    name: "Rose Petal Honey",
    category: "honey",
    price: 399,
    originalPrice: 499,
    weight: "250g",
    image: "assets/images/rose_petal_honey.png",
    description: "Infused with organic rose petals, this pure honey offers a sweet, floral aroma and a rich, natural flavor. Perfect for boosting immunity and soothing throats.",
    benefits: [
      "Natural immunity booster",
      "Soothes sore throat and cough",
      "Rich in antioxidants",
      "Promotes healthy, glowing skin"
    ],
    nutritionalFacts: {
      "Energy": "320 kcal",
      "Carbohydrates": "80g",
      "Natural Sugars": "78g",
      "Protein": "0.3g",
      "Fat": "0g",
      "Vitamin C": "1.2mg"
    },
    howToUse: "Take a teaspoon directly, mix in warm water or milk, or spread over toast/pancakes.",
    rating: 4.8,
    reviewsCount: 142,
    isBestseller: true
  },
  {
    id: "ginger-honey",
    name: "Ginger Honey",
    category: "honey",
    price: 349,
    originalPrice: 399,
    weight: "250g",
    image: "assets/images/ginger_honey.png",
    description: "A warming blend of raw honey and spicy ginger. An ancient grandmother's remedy for cold, cough, and digestive health.",
    benefits: [
      "Relieves cough and sore throat",
      "Aids digestion and metabolism",
      "Anti-inflammatory properties",
      "100% natural, no additives"
    ],
    nutritionalFacts: {
      "Energy": "315 kcal",
      "Carbohydrates": "79g",
      "Natural Sugars": "76g",
      "Protein": "0.4g",
      "Fat": "0g",
      "Ginger Extract": "5%"
    },
    howToUse: "Ideal with warm water or herbal tea. Consume a spoonful daily in the morning to build immunity.",
    rating: 4.9,
    reviewsCount: 188,
    isBestseller: true
  },
  {
    id: "dry-fruits-honey",
    name: "Dry Fruits Honey",
    category: "honey",
    price: 499,
    originalPrice: 599,
    weight: "250g",
    image: "assets/images/dry_fruits_honey.png",
    description: "Premium almonds, cashews, and walnuts drenched in pure wild honey. A delicious power pack of energy and nutrition.",
    benefits: [
      "Instant energy booster",
      "Rich source of protein and healthy fats",
      "Improves brain health and memory",
      "Perfect healthy snack for all ages"
    ],
    nutritionalFacts: {
      "Energy": "440 kcal",
      "Carbohydrates": "62g",
      "Protein": "8.5g",
      "Fat": "18g",
      "Dietary Fiber": "3.2g",
      "Iron": "2.1mg"
    },
    howToUse: "Enjoy as a snack directly, add to your morning cereal, oatmeal, or milkshakes.",
    rating: 4.7,
    reviewsCount: 96,
    isBestseller: false
  },
  {
    id: "wild-honey-black-forest",
    name: "Wild Honey (Black Forest)",
    category: "honey",
    price: 599,
    originalPrice: 699,
    weight: "250g",
    image: "assets/images/wild_honey.png",
    description: "Exquisite dark honey harvested from wild bumble bees in the deep forests. Highly potent, thick, and rich in mineral content.",
    benefits: [
      "High mineral and enzyme content",
      "Strong antibacterial qualities",
      "Improves sleep patterns organically",
      "Unpasteurized and raw"
    ],
    nutritionalFacts: {
      "Energy": "330 kcal",
      "Carbohydrates": "82g",
      "Natural Sugars": "80g",
      "Protein": "0.2g",
      "Fat": "0g",
      "Potassium": "150mg"
    },
    howToUse: "Consume raw or mix with warm lime water. Avoid heating to preserve active enzymes.",
    rating: 5.0,
    reviewsCount: 210,
    isBestseller: true
  },
  {
    id: "oal-ka-achar",
    name: "Oal Ka Achar (Jimikand/Elephant Yam)",
    category: "pickles",
    price: 249,
    originalPrice: 299,
    weight: "400g",
    image: "assets/images/oal_pickle.png",
    description: "Traditional Bihari-style Jimikand (Elephant Foot Yam) pickle. Grated and seasoned with mustard oil, lemon juice, and hand-ground spices.",
    benefits: [
      "Rich in dietary fiber",
      "Traditional recipe from grandmothers",
      "No artificial preservatives",
      "Aids gut health"
    ],
    nutritionalFacts: {
      "Energy": "180 kcal",
      "Protein": "2.1g",
      "Carbohydrates": "12g",
      "Fat": "14g",
      "Sodium": "820mg"
    },
    howToUse: "Pairs beautifully with hot parathas, khichdi, or simple dal-rice.",
    rating: 4.7,
    reviewsCount: 78,
    isBestseller: false
  },
  {
    id: "kathal-ka-achar",
    name: "Kathal Ka Achar (Jackfruit Pickle)",
    category: "pickles",
    price: 279,
    originalPrice: 329,
    weight: "400g",
    image: "assets/images/kathal_pickle.png",
    description: "Tender jackfruit pieces cured in aromatic spices and pure cold-pressed mustard oil. A savory delight that mimics a rich texture.",
    benefits: [
      "Made with young, tender jackfruit",
      "Matured naturally under the sun",
      "Aromatic Indian spices",
      "Low cholesterol, high taste"
    ],
    nutritionalFacts: {
      "Energy": "165 kcal",
      "Protein": "1.8g",
      "Carbohydrates": "15g",
      "Fat": "11g",
      "Sodium": "790mg"
    },
    howToUse: "Excellent side for chole bhature, mathri, or rotis.",
    rating: 4.8,
    reviewsCount: 115,
    isBestseller: true
  },
  {
    id: "amla-ka-achar",
    name: "Amla Ka Achar (Indian Gooseberry)",
    category: "pickles",
    price: 199,
    originalPrice: 249,
    weight: "400g",
    image: "assets/images/amla_pickle.png",
    description: "Tangy and spicy gooseberry pickle packed with Vitamin C. Made with fresh, plump amlas and healthy spices.",
    benefits: [
      "Excellent source of Vitamin C",
      "Boosts immunity and digestion",
      "Traditional sun-dried preparation",
      "Detoxifies the body naturally"
    ],
    nutritionalFacts: {
      "Energy": "142 kcal",
      "Protein": "1.1g",
      "Carbohydrates": "10g",
      "Fat": "10.8g",
      "Vitamin C": "45mg"
    },
    howToUse: "Serve a small portion with any meal to enhance taste and immunity.",
    rating: 4.6,
    reviewsCount: 92,
    isBestseller: false
  },
  {
    id: "jamun-ka-sirka",
    name: "Jamun Ka Sirka (Black Plum Vinegar)",
    category: "sirka",
    price: 299,
    originalPrice: 349,
    weight: "500ml",
    image: "assets/images/jamun_sirka.png",
    description: "100% natural, brewed jamun vinegar. Excellent for blood sugar management, digestion, and urinary system health.",
    benefits: [
      "Helps regulate blood sugar levels",
      "Aids in weight management",
      "Improves kidney and liver function",
      "Natural remedy for gastric problems"
    ],
    nutritionalFacts: {
      "Energy": "22 kcal",
      "Carbohydrates": "4.8g",
      "Sugar": "0g",
      "Sodium": "15mg",
      "Acidity": "4.5%"
    },
    howToUse: "Mix 10-15ml in a glass of water and consume on empty stomach or post meals, twice daily.",
    rating: 4.9,
    reviewsCount: 154,
    isBestseller: true
  },
  {
    id: "mango-mint-chutney",
    name: "Premium Mango Mint Chutney",
    category: "chutneys",
    price: 149,
    originalPrice: 199,
    weight: "250g",
    image: "assets/images/mango_mint_chutney.png",
    description: "A refreshing blend of raw green mangoes, fresh garden mint, green chilies, and hand-selected spices.",
    benefits: [
      "Cooling digestant",
      "Made with fresh organic mint",
      "No artificial colors",
      "Zesty, sweet-sour taste profile"
    ],
    nutritionalFacts: {
      "Energy": "98 kcal",
      "Carbohydrates": "22g",
      "Dietary Fiber": "1.5g",
      "Fat": "0.5g"
    },
    howToUse: "A perfect accompaniment for samosas, kebabs, tikkas, and sandwiches.",
    rating: 4.5,
    reviewsCount: 64,
    isBestseller: false
  },
  {
    id: "spicy-garlic-chutney",
    name: "Spicy Garlic Tomato Chutney",
    category: "chutneys",
    price: 149,
    originalPrice: 179,
    weight: "250g",
    image: "assets/images/garlic_tomato_chutney.png",
    description: "A fiery red chutney packed with slow-roasted garlic cloves, vine-ripened tomatoes, and dried red chilies.",
    benefits: [
      "Rich in garlic health benefits",
      "Boosts metabolism",
      "Fiery and appetizing",
      "Authentic rural D2C flavor"
    ],
    nutritionalFacts: {
      "Energy": "120 kcal",
      "Carbohydrates": "14g",
      "Protein": "2.0g",
      "Fat": "6.5g"
    },
    howToUse: "Pairs perfectly with dosas, idlis, parathas, and vada pav.",
    rating: 4.7,
    reviewsCount: 88,
    isBestseller: false
  },
  {
    id: "paneer-butter-masala",
    name: "Ready-To-Eat Paneer Butter Masala",
    category: "ready-to-eat",
    price: 219,
    originalPrice: 269,
    weight: "300g",
    image: "assets/images/paneer_butter_masala.png",
    description: "Rich and creamy cottage cheese cubes cooked in a buttery tomato-onion gravy with aromatic spices. Preserved using retort technology without chemicals.",
    benefits: [
      "Ready in just 2 minutes",
      "Zero preservatives, zero chemicals",
      "Rich in milk protein",
      "Authentic restaurant-style taste"
    ],
    nutritionalFacts: {
      "Energy": "395 kcal",
      "Protein": "12.5g",
      "Carbohydrates": "14g",
      "Fat": "31g",
      "Saturated Fat": "15g"
    },
    howToUse: "Submerge the sealed pouch in boiling water for 3-5 mins, or microwave the contents in a bowl for 2 mins.",
    rating: 4.6,
    reviewsCount: 104,
    isBestseller: false
  },
  {
    id: "dal-makhani",
    name: "Ready-To-Eat Dal Makhani",
    category: "ready-to-eat",
    price: 189,
    originalPrice: 229,
    weight: "300g",
    image: "assets/images/dal_makhani.png",
    description: "Black lentils and red kidney beans slow-cooked overnight with fresh cream, butter, and spices. Rich, smoky, and comforting.",
    benefits: [
      "Slow-cooked for 12 hours for deep flavor",
      "High in protein and fiber",
      "Ready to eat - heat & serve",
      "Clean ingredients only"
    ],
    nutritionalFacts: {
      "Energy": "290 kcal",
      "Protein": "9.8g",
      "Carbohydrates": "28g",
      "Fat": "15.4g",
      "Dietary Fiber": "6.2g"
    },
    howToUse: "Empty content into a bowl and microwave for 2 minutes, or heat pouch in boiling water.",
    rating: 4.8,
    reviewsCount: 135,
    isBestseller: true
  },
  {
    id: "veggie-spring-rolls",
    name: "Frozen Veggie Spring Rolls",
    category: "frozen-snacks",
    price: 249,
    originalPrice: 299,
    weight: "400g (10 Pcs)",
    image: "assets/images/veggie_spring_rolls.png",
    description: "Crispy, golden pastry sheets packed with finely shredded vegetables, glass noodles, and Asian seasonings. Freeze-locked freshness.",
    benefits: [
      "Super crispy outer layer",
      "Stays fresh for 6 months frozen",
      "Quick and easy tea-time snack",
      "No added MSG"
    ],
    nutritionalFacts: {
      "Energy": "210 kcal per 100g",
      "Protein": "4.2g",
      "Carbohydrates": "34g",
      "Fat": "6.0g"
    },
    howToUse: "Deep fry, air fry at 180°C, or bake directly from frozen until golden brown. Serve hot.",
    rating: 4.4,
    reviewsCount: 57,
    isBestseller: false
  },
  {
    id: "crispy-potato-bites",
    name: "Frozen Crispy Potato Bites",
    category: "frozen-snacks",
    price: 199,
    originalPrice: 249,
    weight: "400g",
    image: "assets/images/potato_bites.png",
    description: "Mouth-watering potato nuggets seasoned with garlic, herbs, and mild chili. Crispy on the outside, fluffy inside.",
    benefits: [
      "Ready to fry, no thawing needed",
      "Perfect snack for kids",
      "High quality potatoes and herbs",
      "Trans-fat free"
    ],
    nutritionalFacts: {
      "Energy": "178 kcal per 100g",
      "Protein": "3.1g",
      "Carbohydrates": "29g",
      "Fat": "5.5g"
    },
    howToUse: "Deep fry for 3 mins or air fry for 10-12 mins till crispy. Toss with peri-peri seasoning if desired.",
    rating: 4.5,
    reviewsCount: 71,
    isBestseller: false
  },
  {
    id: "breakfast-honey-combo",
    name: "Breakfast Honey Combo",
    category: "combos",
    price: 699,
    originalPrice: 898,
    weight: "500g (2 x 250g)",
    image: "assets/images/honey_combo.png",
    description: "Start your morning healthy with our best-selling honeys. Includes Rose Petal Honey (250g) and Ginger Honey (250g). Saves 22%!",
    benefits: [
      "Best of both worlds: Floral & Spicy",
      "Perfect morning wellness kit",
      "Beautiful combo packaging",
      "Save ₹199 compared to buying separately"
    ],
    nutritionalFacts: "Refer to individual pack details.",
    howToUse: "Use Ginger Honey in your morning tea, and Rose Petal Honey on breakfast pancakes or warm rotis.",
    rating: 4.9,
    reviewsCount: 160,
    isBestseller: true
  },
  {
    id: "traditional-pickle-combo",
    name: "Traditional Pickle Combo",
    category: "combos",
    price: 649,
    originalPrice: 727,
    weight: "1.2kg (3 x 400g)",
    image: "assets/images/pickle_combo.png",
    description: "The ultimate Indian pickle package. Includes Oal (Yam) Pickle (400g), Kathal (Jackfruit) Pickle (400g), and Amla (Gooseberry) Pickle (400g).",
    benefits: [
      "Gives a complete spectrum of tastes: Tangy, Spicy, Savory",
      "Authentic sun-cured traditional recipes",
      "Saves over ₹78",
      "Ideal pantry stock"
    ],
    nutritionalFacts: "Refer to individual pack details.",
    howToUse: "Pairs with lunch and dinner meals, rotis, rice, and parathas.",
    rating: 4.8,
    reviewsCount: 124,
    isBestseller: true
  },
  {
    id: "complete-immunity-pack",
    name: "Complete Immunity Pack",
    category: "combos",
    price: 949,
    originalPrice: 1097,
    weight: "1.15kg Combined",
    image: "assets/images/immunity_combo.png",
    description: "Supercharge your family's health. Combines Wild Honey (250g), Amla Pickle (400g), and Jamun ka Sirka (500ml). Highly recommended by customers.",
    benefits: [
      "Natural wellness and disease resistance",
      "Amla for Vit C, Jamun Sirka for digestion, Wild Honey for immunity",
      "Saves ₹148",
      "100% organic wellness"
    ],
    nutritionalFacts: "Refer to individual pack details.",
    howToUse: "Take Jamun Sirka and Wild Honey in the morning, and enjoy Amla Pickle with meals.",
    rating: 5.0,
    reviewsCount: 310,
    isBestseller: true
  },
  {
    id: "gourmet-gift-box",
    name: "Gourmet Gift Box",
    category: "gift-packs",
    price: 899,
    originalPrice: 1127,
    weight: "900g Combined",
    image: "assets/images/gift_box.png",
    description: "Share the taste of wellness with your loved ones. Beautifully packed gift box containing Dry Fruits Honey (250g), Kathal Pickle (400g), and Mango Mint Chutney (250g).",
    benefits: [
      "Premium premium box with festive sleeve",
      "Ideal gift for festivals and special occasions",
      "Cured glass jars inside",
      "Saves ₹228"
    ],
    nutritionalFacts: "Refer to individual pack details.",
    howToUse: "Gift it to health-conscious friends, family, or business partners. Safe, bubble-wrapped transit.",
    rating: 4.9,
    reviewsCount: 84,
    isBestseller: true
  }
];

// Keep both _id and sku in all product mappings
products.forEach(p => {
  p._id = p.id;
  p.sku = p.id;
});

// Helper functions for product management
function getProductById(idOrId) {
  if (typeof window !== 'undefined' && window.products) {
    const found = window.products.find(p => p._id === idOrId || p.sku === idOrId || p.id === idOrId);
    if (found) return found;
  }
  return products.find(p => p._id === idOrId || p.sku === idOrId || p.id === idOrId);
}

function getProductsByCategory(category) {
  if (category === 'all') return products;
  return products.filter(p => p.category === category);
}

function searchProducts(query) {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  return products.filter(p => 
    p.name.toLowerCase().includes(q) || 
    p.category.toLowerCase().includes(q) ||
    p.description.toLowerCase().includes(q)
  );
}

// Export for module systems or attach to window for script inclusion
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { products, getProductById, getProductsByCategory, searchProducts };
} else {
  window.products = products;
  window.getProductById = getProductById;
  window.getProductsByCategory = getProductsByCategory;
  window.searchProducts = searchProducts;
}
