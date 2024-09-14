import express from 'express';
import { uploadBlueprint, submitBlueprintForm } from '../controllers/blueprint.controller.js';

const router = express.Router();


router.route('/api/upload')
  .post(uploadBlueprint)
  

router.route('/api/submit-blueprint')
  .post(submitBlueprintForm)
  

export default router;
