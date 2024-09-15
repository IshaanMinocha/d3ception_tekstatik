import mongoose from 'mongoose';

const modelSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    image: {
        type: String,
        required: true
    },
    model: {
        glb: { type: String },
        fbx: { type: String },
        usdz: { type: String },
    },
    thumbnail: {
        type: String,
    },
    texture: {
        type: String,
    },
    meshyId: {
        type: String,
        required: true
    },
    status: {
        type: String,
        default: 'PENDING'
    },
}, {
    timestamps: true,
    collection: 'Model'
});

const Model = mongoose.model('Model', modelSchema);

export default Model;