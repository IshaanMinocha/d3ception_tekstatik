import express from 'express';
import { registerUser, loginUser, getUserProfile, getAllTeamleads, getAllTrainees } from '../controllers/user.controller.js';
import { adminOnly, protect, teamleadOnly } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.route('/register').post(registerUser);

router.route('/login').post(loginUser);

router.route('/profile').get(getUserProfile);

router.route('/trainees').get(teamleadOnly, getAllTrainees);

router.route('/teamleads').get(adminOnly, getAllTeamleads);

export default router;