import mongoose from 'mongoose';
import 'dotenv/config';
export const connectDB = async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) return; // already connected
    await mongoose.connect(process.env.MONGO_URL);
    console.log('MONGODB CONNECTED SUCCESSFULLY ✅');
  } catch (error) {
    console.log('ERROR CONNECTING TO MONGODB', error);
    throw error; // Exit with failure
  }
};  
