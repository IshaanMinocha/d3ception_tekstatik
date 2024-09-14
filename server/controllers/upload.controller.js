import asyncHandler from 'express-async-handler';
import { getDataUri } from '../utils/datauri.util.js';
import cloudinary from '../utils/cloudinary.util.js';

const uploadImage = asyncHandler(async (req, res) => {
    try {
        const file = req.file;

        if (!file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded.'
            });
        }

        const fileUri = getDataUri(file);
        const cloudinaryResult = await cloudinary.v2.uploader.upload(fileUri.content);
        const image_url = cloudinaryResult.secure_url;
        const image_id = cloudinaryResult.public_id;

        return res.status(200).json({
            success: true,
            message: 'Image uploaded successfully.',
            image_url,
            image_id
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Image upload failed',
            error
        });
    }
});

export { uploadImage };