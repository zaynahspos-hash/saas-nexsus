import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import { connectDB } from './config/db';
import apiRoutes from './routes/apiRoutes';
import configureCloudinary from './config/cloudinary';

// Load Config
dotenv.config();

// Connect to Database
connectDB();

// Configure Cloudinary
configureCloudinary();

const app = express();

// Middleware
app.use(helmet() as any);

// Dynamic CORS Configuration
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000'
];

// Add Production Frontend URL if available
if (process.env.FRONTEND_URL) {
  // Remove trailing slash if present to ensure exact match
  const productionUrl = process.env.FRONTEND_URL.replace(/\/$/, "");
  allowedOrigins.push(productionUrl);
  allowedOrigins.push(`${productionUrl}/`); // Allow with trailing slash just in case
  console.log(`🌍 CORS Allowed Origin added: ${productionUrl}`);
}

app.use(cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      
      // Check if origin is allowed
      if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== 'production') {
        callback(null, true);
      } else {
        console.warn(`[CORS] Blocked request from: ${origin}`);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
}));

app.use(express.json() as any);
app.use(express.urlencoded({ extended: false }) as any);

// Health Check
app.get('/', (req: any, res: any) => {
    res.status(200).send('SaaS Nexus API is running');
});

app.get('/health', (req: any, res: any) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api', apiRoutes);

// Error Handler
app.use((err: any, req: any, res: any, next: any) => {
    console.error(err.stack);
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode);
    res.json({
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => console.log(`🚀 Server running on port ${PORT}`));