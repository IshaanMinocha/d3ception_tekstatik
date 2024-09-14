import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import blueprintRoutes from './routes/blueprint.router.js';

dotenv.config();

const app = express();


connectDB();


app.use(cors({
  origin: process.env.CORS_ORIGIN
}));

app.use(express.json());

app.use('/api', blueprintRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
