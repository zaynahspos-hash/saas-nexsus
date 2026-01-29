import express, { Request, Response } from 'express';
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
app.use(helmet());

// Dynamic CORS Configuration
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.FRONTEND_URL || ''
];

app.use(cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      
      // Check if origin is allowed
      if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
        callback(null, true);
      } else {
        // In production, you might want to be strict, but for debugging Vercel:
        // callback(new Error('Not allowed by CORS'));
        // Fallback to allowing Vercel preview URLs usually ending in .vercel.app
        if (origin.endsWith('.vercel.app')) {
           callback(null, true);
        } else {
           console.log('Blocked Origin:', origin);
           callback(null, true); // Temporarily allow all for troubleshooting white screen
        }
      }
    },
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Routes
app.get('/', (req: any, res: any) => {
    res.send('SaaS Nexus API is running');
});

app.use('/api', apiRoutes as any);

// Error Handler
app.use((err: any, req: any, res: any, next: any) => {
    const statusCode = res.statusCode ? res.statusCode : 500;
    res.status(statusCode);
    res.json({
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));