import { Joi, Segments } from 'celebrate';
import { isValidObjectId } from 'mongoose';

export const getAllRecipesSchema = {
  [Segments.QUERY]: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    perPage: Joi.number().integer().min(1).max(50).default(12),
    category: Joi.string(),
    ingredient: Joi.string(),
    keyword: Joi.string().trim().allow(''),
  }),
};

export const getMyRecipesSchema = {
  [Segments.QUERY]: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    perPage: Joi.number().integer().min(1).max(50).default(10),
  }),
};

const objectIdValidator = (value, helpers) => {
  return !isValidObjectId(value) ? helpers.message('Invalid id format') : value;
};

export const recipeIdSchema = {
  [Segments.PARAMS]: Joi.object({
    recipeId: Joi.string().custom(objectIdValidator).required(),
  }),
};

const parseAndValidateIngredients = (value, helpers) => {
  let parsedValue;

  try {
    parsedValue = typeof value === 'string' ? JSON.parse(value) : value;
  } catch {
    return helpers.message('"ingredients" must be a valid JSON string');
  }

  const arraySchema = Joi.array()
    .items(
      Joi.object({
        id: Joi.string().required(),
        measure: Joi.string().required(),
      }),
    )
    .min(2)
    .max(16)
    .required();

  const { error } = arraySchema.validate(parsedValue);

  if (error) {
    return helpers.message(error.message);
  }

  return parsedValue;
};

export const createRecipeSchema = {
  [Segments.BODY]: Joi.object({
    title: Joi.string().max(64).required(),
    description: Joi.string().max(200).required(),
    time: Joi.number().min(1).max(360).required(),
    calories: Joi.number().integer().min(1).max(10000).optional(),
    category: Joi.string().required(),
    ingredients: Joi.any().custom(parseAndValidateIngredients).required(),
    instructions: Joi.string().max(1200).required(),
  }),
};
export const updateRecipeSchema = {};

export const getFavoriteRecipesSchema = {
  [Segments.QUERY]: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    perPage: Joi.number().integer().min(1).max(50).default(12),
  }),
};
