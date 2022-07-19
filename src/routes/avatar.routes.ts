import express, { Router } from 'express';
import multer from 'multer';
import avatarController from '../controllers/avatar.controller';
import authMiddleware from '../middleware/auth.middleware';

const router: Router = express.Router();
router.get('/', avatarController.getAllAvatars);
router.get('/:id', avatarController.getAvatar);

router.use(authMiddleware.protect); // all routes are below are protected
router.use(authMiddleware.restrictedTo('admin')); // all routes are below restricted to admin
// create

const multerSingle = multer();
router.route('/upload/url').post(avatarController.uploadWithUrl);
router.route('/upload/raw').post(multerSingle.single('avatar'), avatarController.uploadRawImage);
router.route('/:id').patch(avatarController.updateAvatar).delete(avatarController.deleteAvatar);

export default router;
