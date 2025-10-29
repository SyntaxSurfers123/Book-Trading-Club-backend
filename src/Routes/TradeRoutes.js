// routes/trade.js
import express from 'express';
import {
  CreateTrade,
  GetRequestedTrades,
  GetTradeRequest,
  GetAcceptedTrades,
} from '../Controllers/TradeController.js';

const router = express.Router();

// ✅ GET: Trades where user is receiver (trade requests sent *to* user)
router.get('/trade-requests/:userId', GetTradeRequest);

// ✅ GET: Accepted trades (where user is sender or receiver)
router.get('/accepted-trades/:userId', GetAcceptedTrades);

// ✅ GET: Requested trades (trades *sent by* the user)
router.get('/requested-trades/:userId', GetRequestedTrades);

// ✅ POST: Create a new trade
router.post('/', CreateTrade);

export default router;
