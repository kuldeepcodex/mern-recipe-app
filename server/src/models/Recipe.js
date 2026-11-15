const mongoose = require('mongoose');

const CATEGORIES = ['Breakfast', 'Lunch', 'Dinner', 'Dessert', 'Snack', 'Vegan', 'Drinks'];

const recipeSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, 'Title is required'], trim: true, maxlength: 120 },
    description: { type: String, trim: true, maxlength: 600, default: '' },
    image: { type: String, trim: true, default: '' },
    category: { type: String, enum: { values: CATEGORIES, message: 'Invalid category' }, default: 'Dinner' },
    cookTime: { type: Number, min: 1, max: 1440, default: 30 }, // minutes
    servings: { type: Number, min: 1, max: 100, default: 2 },
    ingredients: {
      type: [String],
      validate: [(v) => v.length > 0, 'Add at least one ingredient'],
    },
    steps: {
      type: [String],
      validate: [(v) => v.length > 0, 'Add at least one step'],
    },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    ratings: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        value: { type: Number, min: 1, max: 5, required: true },
        _id: false,
      },
    ],
    favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

recipeSchema.statics.CATEGORIES = CATEGORIES;

module.exports = mongoose.model('Recipe', recipeSchema);
