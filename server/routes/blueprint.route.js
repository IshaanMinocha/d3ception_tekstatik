import express from 'express';
import { uploadBlueprint, submitBlueprintForm } from '../controllers/blueprint.controller.js';

const router = express.Router();

router.route('/upload').post(uploadBlueprint)

router.route('/submit').post(submitBlueprintForm)

export default router;