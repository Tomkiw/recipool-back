import { Router } from 'express';
import { celebrate } from 'celebrate';
import { authenticate } from '../middleware/authenticate.js';
import {
  getAllRecipes,
  getRecipeById,
  deleteRecipeFromFavorite,
  getFavoriteRecipes,
  getMyRecipes,
  createRecipe,
  addRecipeToFavorites,
} from '../controllers/recipesController.js';
import {
  getAllRecipesSchema,
  getMyRecipesSchema,
  recipeIdSchema,
  createRecipeSchema,
  getFavoriteRecipesSchema,
} from '../validations/recipesValidation.js';
import { upload } from '../middleware/multer.js';

const router = Router();

router.get('/api/recipes', celebrate(getAllRecipesSchema), getAllRecipes);

router.get(
  '/api/recipes/favorites',
  authenticate,
  celebrate(getFavoriteRecipesSchema),
  getFavoriteRecipes);

router.get('/api/recipes/:recipeId', celebrate(recipeIdSchema), getRecipeById);
router.post(
  '/api/recipes/',
  authenticate,
  upload.single('image'),
  celebrate(createRecipeSchema),
  createRecipe,
);

router.post(
  '/api/recipes/:recipeId/favorite',
  authenticate,
  celebrate(recipeIdSchema),
  addRecipeToFavorites,
);

router.delete(
  '/api/recipes/:recipeId/favorite',
  authenticate,
  celebrate(recipeIdSchema),
  deleteRecipeFromFavorite,
);

router.get(
  '/api/my/recipes',
  authenticate,
  celebrate(getMyRecipesSchema),
  getMyRecipes,
);
export default router;
