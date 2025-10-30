// routes/trade.js
import express from 'express';
import {
  CreateTrade,
  GetRequestedTrades,
  GetTradeRequest,
  GetAcceptedTrades,
  AcceptTrade,
  RejectTrade,
  GetRejectedTrades,
} from '../Controllers/TradeController.js';

const router = express.Router();

// ✅ GET: Trades where user is receiver (trade requests sent *to* user)
router.get('/trade-requests/:userId', GetTradeRequest);

// ✅ GET: Accepted trades (where user is sender or receiver)
router.get('/accepted-trades/:userId', GetAcceptedTrades);

// ✅ GET: Requested trades (trades *sent by* the user)
router.get('/requested-trades/:userId', GetRequestedTrades);

// ✅ GET: Rejected trades (where user is sender or receiver)
router.get('/rejected-trades/:userId', GetRejectedTrades);

// ✅ PUT: Accept Trade
router.put('/accept-trade/:id', AcceptTrade);

// ✅ PUT: Reject Trade
router.put('/reject-trade/:id', RejectTrade);

// ✅ POST: Create a new trade
router.post('/', CreateTrade);

export default router;
