// routes/order.js
import express from 'express';
import { CreateOrders, GetOrders } from '../Controllers/OrderController.js';

const router = express.Router();

// GET: all orders for a user
router.get('/:userId', GetOrders);

// POST: add orders from Cart Items
router.post('/', CreateOrders);

export default router;
