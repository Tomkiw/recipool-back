import { celebrate } from 'celebrate';
import { Router } from 'express';
import { loginUserSchema, registerUserSchema } from '../validations/authValidation.js';
import {
  getAuthSession,
  loginUser,
  logoutUser,
  refreshUserSession,
  registerUser,
} from '../controllers/authController.js';
import { authenticate } from '../middleware/authenticate.js';

const router = Router();

router.post('/auth/register', celebrate(registerUserSchema), registerUser);
router.post('/auth/login', celebrate(loginUserSchema), loginUser);
router.get('/auth/session', authenticate, getAuthSession);
router.post('/auth/refresh', refreshUserSession);
router.post('/auth/logout', authenticate, logoutUser);

export default router;
