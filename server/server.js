import express from 'express';
import cors from 'cors';
import connectDB from './config/db.js';
import envConfig from './config/dotenv.js';
import blueprintRoutes from './routes/blueprint.route.js';
import userRoutes from './routes/user.route.js'
import modelRoutes from './routes/model.route.js'
import uploadRoutes from './routes/upload.route.js'

envConfig();
connectDB();

const app = express();

const PORT = process.env.PORT || 3000;

const allowedOrigins = [process.env.CORS_ORIGIN, 'file://'];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true
}));

app.options('*', cors());  

app.use(express.json());

app.use('/blueprint', blueprintRoutes);
app.use('/user', userRoutes);
app.use('/upload', uploadRoutes);
app.use('/model', modelRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

app.get("/", (req, res) => {
  res.json({ success: true, message: "cors server up!" })
})