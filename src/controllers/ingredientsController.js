import { getAllIngredients } from '../services/ingredients.js';

export const getIngredients = async (req, res, next) => {
  try {
    const { name } = req.query;
    const filter = {};
    if (name) filter.name = { $regex: name, $options: 'i' };

    const ingredients = await getAllIngredients(filter);
    res.status(200).json(ingredients);
  } catch (error) {
    next(error);
  }
};
