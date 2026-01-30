import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI;
    if (!uri) {
        console.warn('⚠️ MONGO_URI is not defined in environment variables. Database connection skipped.');
        return;
    }
    const conn = await mongoose.connect(uri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error: any) {
    console.error(`❌ Database Connection Error: ${error.message}`);
    // Do not exit process, allow server to start so we can see logs/status
    // (process as any).exit(1); 
  }
};