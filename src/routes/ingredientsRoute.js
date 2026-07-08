import { Router } from 'express';
import { celebrate } from 'celebrate';

import { getIngredients } from '../controllers/ingredientsController.js';
import { getIngredientsSchema } from '../validations/ingredientsValidation.js';

const ingredientsRouter = Router();

ingredientsRouter.get(
  '/api/ingredients',
  celebrate(getIngredientsSchema),
  getIngredients,
);

export default ingredientsRouter;
