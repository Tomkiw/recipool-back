import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { getCurrentUser, updateUserAvatar } from '../controllers/userController.js';
import { upload } from '../middleware/multer.js';

const router = Router();

router.use('/users', authenticate);

router.get('/users/current/', getCurrentUser);

router.patch('/users/avatar', upload.single('avatar'), updateUserAvatar);

export default router;
