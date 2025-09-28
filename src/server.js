import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import BookRoutes from './Routes/BookRoutes.js';
import { connectDB } from './Config/db.js';
// Middlewares and configurations
const app = express();
dotenv.config();
app.use(cors());
app.use(express.json());
const PORT = process.env.PORT || 3001;

/////////////////////// Routes //////////////////////////////////
app.use('/api/books', BookRoutes);
/////////////////////// Routes //////////////////////////////////

/////////////////////// ConnectDB //////////////////////////////////
connectDB();
/////////////////////// ConnectDB //////////////////////////////////

app.get('/', (req, res) => {
  res.send('Welcome to the Book Trading Club server!');
});

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}...`);
});
