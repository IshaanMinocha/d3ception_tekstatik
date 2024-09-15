import asyncHandler from 'express-async-handler';
import Model from '../models/model.model.js';
import axios from 'axios';
import envConfig from '../config/dotenv.js'

envConfig();

const meshyApiKey = process.env.MESHY_API_KEY;
const meshyApiUrl = process.env.MESHY_API_URL;

const createModelTask = asyncHandler(async (req, res) => {
    try {
        const user = req.user._id;
        const { imageUrl } = req.body;

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'not logged in'
            });
        }

        if (!imageUrl) {
            return res.status(400).json({
                success: false,
                message: 'no image url provided'
            });
        }

        const response = await axios.post(`${meshyApiUrl}`, {
            image_url: imageUrl,
            enable_pbr: true,
            surface_mode: "hard"
        }, {
            headers: { Authorization: `Bearer ${meshyApiKey}` }
        });

        const meshyId = response.data.result;

        const newModel = await Model.create({
            user,
            image: imageUrl,
            meshyId,
            status: 'PENDING'
        });

        res.status(201).json({
            success: true,
            message: '3D model task created successfully',
            meshyId,
            model: newModel
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to create 3D model task',
            error
        });
    }
});

const getModel = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        const model = await Model.findOne({ meshyId: id });

        if (!model) {
            return res.status(404).json({
                success: false,
                message: '3D model task not found'
            });
        }

        const response = await axios.get(`${meshyApiUrl}/${id}`, {
            headers: { Authorization: `Bearer ${meshyApiKey}` }
        });

        const modelData = response.data;

        if (response.data.status === 'SUCCEEDED') {

            model.status = modelData.status;
            model.model.glb = modelData.model_urls.glb;
            model.model.fbx = modelData.model_urls.fbx;
            model.model.uzdz = modelData.model_urls.uzdz;
            model.model.thumbnail = modelData.thumbnail_url;
            model.model.texture = modelData.texture_urls.base_color;

            await model.save();

            res.status(201).json({
                success: true,
                model,
                message: '3D model task updated successfully'
            });
        } else if (response.data.status === 'FAILED') {
            res.status(200).json({
                success: true,
                model: {
                    status: model.status,
                },
                message: "error from meshy server",
                error: response.data.task_error.message
            });
        } else {
            res.status(200).json({
                success: true,
                model: {
                    status: model.status,
                },
                progress: response.data.progress
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve 3D model',
            error
        });
    }
});

export { createModelTask, getModel };
