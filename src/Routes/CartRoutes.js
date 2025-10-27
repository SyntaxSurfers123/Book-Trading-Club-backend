// routes/cart.js
import express from 'express';
import {
  AddProductToCart,
  DeleteCartItem,
  GetCart,
} from '../Controllers/CartController.js';

const router = express.Router();

// GET: all cart items for a user
router.get('/:userId', GetCart);

// POST: add an item to cart
router.post('/', AddProductToCart);

// DELETE: remove a specific cart item
router.delete('/:id', DeleteCartItem);

export default router;
