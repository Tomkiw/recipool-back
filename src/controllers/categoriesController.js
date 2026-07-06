import { Categories } from '../models/categories.js';

export const getCategoriesController = async (req, res) => {
  const categories = await Categories.find();

  res.status(200).json(categories);
};
