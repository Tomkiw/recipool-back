import { Ingredient } from '../models/ingredients.js';

export async function getAllIngredients(filter = {}) {
  return Ingredient.find(filter);
}
