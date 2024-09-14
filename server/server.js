import express from 'express';
import cors from 'cors';
import connectDB from './config/db.js';
import envConfig from './config/dotenv.js';
import blueprintRoutes from './routes/blueprint.route.js';
import userRoutes from './routes/user.route.js'

envConfig();
connectDB();

const app = express();

const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: process.env.CORS_ORIGIN
}));
app.use(express.json());

app.use('/blueprint', blueprintRoutes);
app.use('/user', userRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

app.get("/", (req, res)=> {
  res.json({success: true, message: "cors server up!"})
})