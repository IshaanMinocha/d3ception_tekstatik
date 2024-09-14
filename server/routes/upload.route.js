import express from 'express';
import { uploadImage } from '../controllers/upload.controller.js';
import { singleUpload } from '../middlewares/multer.middleware.js';

const router = express.Router();

router.route('/blueprint').post(singleUpload, uploadImage);

export default router;
