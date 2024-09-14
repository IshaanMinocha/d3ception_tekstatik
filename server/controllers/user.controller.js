import User from '../models/user.model.js';
import asyncHandler from 'express-async-handler';
import jwt from 'jsonwebtoken';
import envConfig from '../config/dotenv.js'

envConfig();

const jwtSecret = process.env.JWT_SECRET;

const generateToken = (id) => {
    return jwt.sign({ id }, jwtSecret, {
        expiresIn: '30d',
    });
};

const registerUser = asyncHandler(async (req, res) => {

    const { username, password } = req.body;
    const userExists = await User.findOne({ username });

    if (userExists) {
        res.status(400).json({
            message: 'User already exists',
            success: false
        });
    }

    const user = await User.create({ username, password });

    if (user) {
        res.status(201).json({
            user: user,
            token: generateToken(user._id),
            success: true,
            message: "User created successfully"
        });

    } else {
        res.status(400).json({
            message: 'Invalid user data',
            success: false
        })
    }
});

const loginUser = asyncHandler(async (req, res) => {

    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (!user) {
        res.status(401).json({
            message: 'User not found',
            success: false
        });
    }

    if (user && (await user.matchPassword(password))) {
        res.status(201).json({
            user: user,
            token: generateToken(user._id),
            success: true,
            message: "Logged in successfully"
        });

    } else {
        res.status(401).json({
            message: 'Invalid mobile number or password',
            success: false
        }
        )
    }
});

const getUserProfile = asyncHandler(async (req, res) => {

    const user = await User.findById(req.user._id).select('-password');

    if (!user) {
        res.status(404).json({
            message: 'User not found',
            success: false
        });
    }

    if (user) {
        res.status(200).json({
            user,
            message: "Profile retrieved successfully",
            success: true
        });
    }

});

const getAllTrainees = asyncHandler(async (req, res) => {
    try {
        const trainee = await User.find({ role: 'trainee' }).select('-password');
        res.status(200).json({
            success: true,
            message: 'Trainees retrieved successfully',
            trainee,
        });
    } catch (error) {
        console.error('Error retrieving trainees:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred while retrieving trainees',
        });
    }
});

const getAllTeamleads = asyncHandler(async (req, res) => {
    try {
        const teamlead = await User.find({ role: 'teamlead' }).select('-password');
        res.status(200).json({
            success: true,
            message: 'Teamleads retrieved successfully',
            teamlead,
        });
    } catch (error) {
        console.error('Error retrieving teamlead:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred while retrieving teamleads',
        });
    }
});

export { registerUser, loginUser, getUserProfile, getAllTrainees, getAllTeamleads };
