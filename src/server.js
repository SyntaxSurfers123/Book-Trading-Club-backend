import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import BookRoutes from './Routes/BookRoutes.js';
import { connectDB } from './Config/db.js';
dotenv.config();
// Middlewares and configurations
const app = express();
app.use(cors());
app.use(express.json());
const PORT = process.env.PORT || 3001;

// Quick health check
app.get('/health', (_req, res) => res.send('ok'));

/////////////////////// Routes //////////////////////////////////
app.use('/api/books', BookRoutes);
/////////////////////// Routes //////////////////////////////////

/////////////////////// ConnectDB //////////////////////////////////
connectDB();
/////////////////////// ConnectDB //////////////////////////////////

app.get('/', (req, res) => {
  res.send('Welcome to the Book Trading Club server!');
});
export default app;
// app.listen(PORT, () => {
//   console.log(`Listening on port ${PORT}...`);
// });
