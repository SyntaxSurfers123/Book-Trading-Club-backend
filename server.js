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
import { app, server } from './src/Config/socket.js';

// Middlewares and configurations

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

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
    server.listen(PORT, () => {
      console.log(`Listening on port ${PORT}…`);
    });
  } catch (err) {
    console.error('❌ Failed to connect to MongoDB:', err?.message || err);
    process.exit(1);
  }
})();
