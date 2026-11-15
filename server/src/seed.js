require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Recipe = require('./models/Recipe');

const recipes = [
  {
    title: 'Fluffy Masala Omelette',
    description: 'A spicy Indian-style omelette with onions, tomatoes and green chillies.',
    category: 'Breakfast', cookTime: 10, servings: 1,
    ingredients: ['2 eggs', '1 small onion, finely chopped', '1 tomato, chopped', '1 green chilli, chopped', 'Handful of coriander', '1/4 tsp turmeric', 'Salt to taste', '1 tbsp oil'],
    steps: ['Beat the eggs with salt and turmeric.', 'Mix in onion, tomato, chilli and coriander.', 'Heat oil in a pan and pour in the mixture.', 'Cook on medium heat until set, flip and cook 1 more minute.'],
  },
  {
    title: 'Paneer Butter Masala',
    description: 'Soft paneer cubes in a rich, creamy tomato gravy. Perfect with naan.',
    category: 'Dinner', cookTime: 40, servings: 4,
    ingredients: ['250 g paneer, cubed', '4 tomatoes, pureed', '1 onion, chopped', '2 tbsp butter', '1/2 cup cream', '1 tsp ginger-garlic paste', '1 tsp kashmiri chilli powder', '1 tsp garam masala', '1 tsp kasuri methi', 'Salt to taste'],
    steps: ['Saute onion in butter until golden, add ginger-garlic paste.', 'Add tomato puree, chilli powder and salt; cook 10 minutes until oil separates.', 'Blend the gravy for a smooth texture and return to the pan.', 'Add paneer, cream, garam masala and kasuri methi; simmer 5 minutes.', 'Serve hot with naan or rice.'],
  },
  {
    title: 'Veg Hakka Noodles',
    description: 'Quick street-style noodles tossed with crunchy vegetables.',
    category: 'Lunch', cookTime: 25, servings: 2,
    ingredients: ['200 g noodles', '1 carrot, julienned', '1/2 capsicum, sliced', '1 cup cabbage, shredded', '2 spring onions', '2 tbsp soy sauce', '1 tbsp chilli sauce', '1 tsp vinegar', '2 tbsp oil', '2 garlic cloves, minced'],
    steps: ['Boil noodles, drain, and toss with a little oil.', 'Heat oil on high flame, fry garlic, then add all vegetables for 2 minutes.', 'Add soy sauce, chilli sauce and vinegar.', 'Add noodles, toss well for 2 minutes and garnish with spring onion greens.'],
  },
  {
    title: 'Classic Chocolate Brownies',
    description: 'Fudgy brownies with a crackly top.',
    category: 'Dessert', cookTime: 35, servings: 9,
    ingredients: ['100 g dark chocolate', '100 g butter', '3/4 cup sugar', '2 eggs', '1/2 cup flour', '2 tbsp cocoa powder', '1/2 cup walnuts, chopped', '1 tsp vanilla extract', 'Pinch of salt'],
    steps: ['Preheat oven to 180°C and line a small baking tin.', 'Melt chocolate and butter together, let cool slightly.', 'Whisk in sugar, eggs and vanilla.', 'Fold in flour, cocoa and salt, then walnuts.', 'Pour into tin and bake 22-25 minutes. Cool before slicing.'],
  },
  {
    title: 'Masala Chai',
    description: 'Strong, aromatic Indian tea with ginger and cardamom.',
    category: 'Drinks', cookTime: 10, servings: 2,
    ingredients: ['1 cup water', '1 cup milk', '2 tsp tea leaves', '1 inch ginger, crushed', '2 cardamom pods, crushed', '2 tsp sugar'],
    steps: ['Boil water with ginger and cardamom for 2 minutes.', 'Add tea leaves and simmer 1 minute.', 'Pour in milk and sugar, bring to a boil, and let it rise twice.', 'Strain and serve hot.'],
  },
  {
    title: 'Chickpea Salad Bowl',
    description: 'A protein-packed, fully vegan salad with lemon-tahini dressing.',
    category: 'Vegan', cookTime: 15, servings: 2,
    ingredients: ['1 can chickpeas, drained', '1 cucumber, diced', '1 cup cherry tomatoes, halved', '1/4 red onion, sliced', 'Handful of parsley', '2 tbsp tahini', 'Juice of 1 lemon', '1 garlic clove, minced', 'Salt and pepper'],
    steps: ['Whisk tahini, lemon juice, garlic, salt, pepper and a splash of water into a dressing.', 'Combine chickpeas and vegetables in a bowl.', 'Pour dressing over, toss, and top with parsley.'],
  },
  {
    title: 'Crispy Masala Corn',
    description: 'Tangy, spicy snack that disappears in minutes.',
    category: 'Snack', cookTime: 15, servings: 2,
    ingredients: ['1 cup sweet corn kernels', '1 tbsp butter', '1/2 tsp chaat masala', '1/4 tsp red chilli powder', '1/2 tsp lemon juice', 'Salt to taste', 'Fresh coriander'],
    steps: ['Boil corn for 5 minutes and drain well.', 'Saute in butter over high heat until slightly crisp.', 'Add chaat masala, chilli powder and salt.', 'Finish with lemon juice and coriander.'],
  },
  {
    title: 'Hyderabadi Chicken Biryani',
    description: 'Fragrant layered biryani cooked dum-style.',
    category: 'Dinner', cookTime: 90, servings: 5,
    ingredients: ['500 g chicken', '2 cups basmati rice', '1 cup yogurt', '3 onions, fried till brown', '2 tbsp ginger-garlic paste', '1 tsp biryani masala', '1 tsp red chilli powder', 'Mint and coriander leaves', 'Saffron soaked in warm milk', '3 tbsp ghee', 'Whole spices (bay leaf, cardamom, cloves, cinnamon)'],
    steps: ['Marinate chicken with yogurt, ginger-garlic paste, spices, half the fried onions and herbs for 1 hour.', 'Parboil rice with whole spices and salt until 70% cooked.', 'Layer chicken at the bottom of a heavy pot, then rice, remaining onions, saffron milk and ghee.', 'Seal the pot and cook on low heat (dum) for 25-30 minutes.', 'Rest 10 minutes, then gently mix and serve with raita.'],
  },
];

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/recipe-app');
    await Recipe.deleteMany({});
    await User.deleteMany({ email: 'demo@recipe.com' });

    const demo = await User.create({ name: 'Demo Chef', email: 'demo@recipe.com', password: 'demo123' });
    await Recipe.insertMany(recipes.map((r) => ({ ...r, author: demo._id })));

    console.log(`Seeded ${recipes.length} recipes.`);
    console.log('Demo login -> email: demo@recipe.com  password: demo123');
  } catch (err) {
    console.error('Seed failed:', err.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
})();
