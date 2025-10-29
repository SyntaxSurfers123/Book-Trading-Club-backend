import Book from '../Models/Book.js';
import Cart from '../Models/Cart.js';
import Order from '../Models/Order.js';
import User from '../Models/User.js';
import { HttpResponse } from '../utils/HttpResponse.js';
import mongoose from 'mongoose';

const isObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

export const GetOrders = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!isObjectId(userId)) {
      return HttpResponse(res, 400, true, 'Invalid user ID');
    }

    const ExistingUser = await User.exists({ _id: userId });
    if (!ExistingUser) return HttpResponse(res, 404, true, 'User not Found');

    const orders = await Order.find({ user: userId })
      .sort('-createdAt')
      .populate([
        { path: 'user', select: 'displayName email' },
        { path: 'book', select: 'title author price imageUrl ISBN Exchange' },
      ])
      .lean();

    if (orders.length === 0) {
      return HttpResponse(res, 200, false, 'No orders found for this user', []);
    }

    return HttpResponse(
      res,
      200,
      false,
      'Fetched user orders successfully',
      orders
    );
  } catch (error) {
    console.error('GetOrders error:', error);
    return HttpResponse(res, 500, true, 'Internal Server Error');
  }
};

export const CreateOrders = async (req, res) => {
  try {
    const { cartitems } = req.body;

    // ✅ Validate input
    if (!cartitems || !Array.isArray(cartitems) || cartitems.length === 0) {
      return HttpResponse(
        res,
        400,
        true,
        'Cart items are required and must be a non-empty array'
      );
    }

    const createdOrders = [];

    for (const cartitem of cartitems) {
      // ✅ Validate individual cart item
      if (!cartitem.user || !cartitem.book) {
        continue; // skip malformed entries instead of crashing
      }

      // ✅ Create new order
      const newOrder = new Order({
        user: cartitem.user,
        book: cartitem.book,
      });

      const savedOrder = await newOrder.save();
      createdOrders.push(savedOrder);

      // ✅ Delete cart item
      if (cartitem._id) {
        await Cart.findByIdAndDelete(cartitem._id);
      }
    }

    // ✅ Return success response
    return HttpResponse(
      res,
      201,
      false,
      'Orders created successfully',
      createdOrders
    );
  } catch (error) {
    console.error('CreateOrders error:', error);
    return HttpResponse(
      res,
      500,
      true,
      error.message || 'Internal Server Error'
    );
  }
};
