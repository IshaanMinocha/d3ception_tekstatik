import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import asyncHandler from 'express-async-handler';
import envConfig from '../config/dotenv.js'

envConfig();

const jwtSecret = process.env.JWT_SECRET;

const protect = asyncHandler(async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, jwtSecret);

            req.user = await User.findById(decoded.id).select('-password');

            if (!req.user) {
                return res.status(401).json({
                    message: 'User not found',
                    success: false,
                });
            }

            next();
        } catch (error) {
            console.error(error);
            res.status(401).json({
                message: 'Not authorized, token failed',
                success: false,
            });
        }
    } else {
        res.status(401).json({
            message: 'Not authorized, no token',
            success: false,
        });
    }
});

const adminOnly = asyncHandler(async (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'Not authorized, no user found'
        });
    }

    const user = await User.findById(req.user._id);

    if (user && user.role === 'admin') {
        next();
    } else {
        return res.status(403).json({
            success: false,
            message: 'Access denied, admin role required'
        });
    }
});

const teamleadOnly = asyncHandler(async (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'Not authorized, no user found'
        });
    }

    const user = await User.findById(req.user._id);

    if (user && (user.role === 'teamlead' || user.role === 'admin')) {
        next();
    } else {
        return res.status(403).json({
            success: false,
            message: 'Access denied, teamlead role required'
        });
    }
});

export { protect, adminOnly, teamleadOnly };