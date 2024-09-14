import express from 'express';
import { uploadBlueprint, submitBlueprintForm } from '../controllers/blueprint.controller.js';

const router = express.Router();

router.post('/upload', uploadBlueprint);
router.post('/submit-blueprint', submitBlueprintForm);

export default router;