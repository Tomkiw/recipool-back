import mongoose from 'mongoose';
import createHttpError from 'http-errors';
import { Recipe } from '../models/recipe.js';
import { User } from '../models/user.js';

export const getRecipeByIdService = async (recipeId) => {
  const query = Recipe.findById(recipeId);
  const registered = mongoose.modelNames();

  if (registered.includes('Ingredient')) {
    query.populate('ingredients.id', 'name img desc');
  }

  if (registered.includes('User')) {
    query.populate('owner', 'name email avatar');
  }

  return query;
};

export const addRecipeToFavoritesService = async (userId, recipeId) => {
  const recipe = await Recipe.findById(recipeId);

  if (!recipe) {
    throw createHttpError(404, 'Recipe not found');
  }

  const user = await User.findByIdAndUpdate(
    userId,
    {
      $addToSet: {
        favorites: recipeId,
      },
    },
    {
      new: true,
    },
  );

  return user;
};
