import { Router } from 'express';
import { getCategoriesController } from '../controllers/categoriesController.js';

const router = Router();

router.get('/api/categories', getCategoriesController);

export default router;
