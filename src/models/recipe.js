import { Schema, model } from 'mongoose';
// import { Categories } from './categories.js';
// import { Ingredient } from './ingredient.js';

const recipeIngredientSchema = new Schema(
  {
    id: { type: String, ref: 'Ingredient', required: true },
    measure: { type: String, required: true, trim: true },
  },
  { _id: false },
);

const recipeSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    time: {
      type: Number,
      required: true,
      min: 1,
    },
    calories: {
      type: Number,
      min: 0,
    },
    category: {
      type: String,
      required: true,
    },
    ingredients: {
      type: [recipeIngredientSchema],
      default: [],
      required: true,
    },
    instructions: {
      type: String,
      required: true,
      trim: true,
    },
    image: {
      type: String,
      default: null,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true },
);

recipeSchema.index({ title: 'text', description: 'text' });
recipeSchema.index({ category: 1 });
recipeSchema.index({ owner: 1 });

export const Recipe = model('Recipe', recipeSchema);
