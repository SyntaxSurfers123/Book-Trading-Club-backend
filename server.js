import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import BookRoutes from './src/Routes/BookRoutes.js';
import FavoritesRoutes from './src/Routes/FavoritesRoutes.js';
import UserRoutes from './src/Routes/UserRoutes.js';
import ReviewsRoutes from './src/Routes/ReviewRoutes.js';
import CartRoutes from './src/Routes/CartRoutes.js';
import OrdersRoutes from './src/Routes/OrderRoutes.js';
import StripeRoutes from './src/Routes/StripeRoutes.js';
import TradeRoutes from './src/Routes/TradeRoutes.js';
import MessageRoutes from './src/Routes/MessageRoutes.js';
import { connectDB } from './src/Config/db.js';

// Middlewares and configurations
const app = express();
app.use(cors());
app.use(express.json());
const PORT = process.env.PORT || 3001;

// Quick health check
app.get('/health', (_req, res) => res.json({ success: true }));
app.get('/api/health', (_req, res) => res.json({ success: true }));

/////////////////////// Routes Start //////////////////////////////////
app.use('/api/books', BookRoutes);
app.use('/api/users', UserRoutes);
app.use('/api/favorites', FavoritesRoutes);
app.use('/api/reviews', ReviewsRoutes);
app.use('/api/cart', CartRoutes);
app.use('/api/orders', OrdersRoutes);
app.use('/', StripeRoutes);
app.use('/api/trades', TradeRoutes);
app.use('/api/messages', MessageRoutes);
/////////////////////// Routes End //////////////////////////////////

app.get('/', (req, res) => {
  res.send('Welcome to the Book Trading Club server!');
});
// ✅ Connect first, then listen
(async () => {
  try {
    await connectDB(); // <-- await here
    app.listen(PORT, () => {
      console.log(`Listening on port ${PORT}…`);
    });
  } catch (err) {
    console.error('❌ Failed to connect to MongoDB:', err?.message || err);
    process.exit(1);
  }
})();
