import express from 'express';
import { createModelTask, getModel } from '../controllers/model.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.route('/create-task').post(protect, createModelTask);

router.route('/get-model/:id').get(protect, getModel);

export default router;