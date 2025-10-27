import Book from '../Models/Book.js';
import Cart from '../Models/Cart.js';
import User from '../Models/User.js';
import { HttpResponse } from '../utils/HttpResponse.js';
import mongoose from 'mongoose';

const isObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

export const GetCart = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!isObjectId(userId)) {
      return HttpResponse(res, 400, true, 'Invalid user ID');
    }

    const ExistingUser = await User.exists({ _id: userId });
    if (!ExistingUser) return HttpResponse(res, 404, true, 'User not Found');

    const cartitems = await Cart.find({ user: userId })
      .sort('-createdAt')
      .populate([
        { path: 'user', select: 'displayName email' },
        { path: 'book', select: 'title author' },
      ]);

    return HttpResponse(
      res,
      200,
      false,
      'Fetched User Cart Items successfully',
      cartitems
    );
  } catch (error) {
    console.error(error);
    return HttpResponse(res, 500, true, 'Internal Server Error');
  }
};

export const AddProductToCart = async (req, res) => {
  try {
    const { user, book } = req.body;

    // required fields
    if (!user) return HttpResponse(res, 400, true, 'UserID is required');
    if (!book) return HttpResponse(res, 400, true, 'BookID is required');

    // validate ObjectId format
    if (!isObjectId(user) || !isObjectId(book)) {
      return HttpResponse(res, 400, true, 'Invalid user or book ID');
    }

    // fetch user (single doc)
    const userDoc = await User.findById(user).select('uid displayName email');
    if (!userDoc) return HttpResponse(res, 404, true, 'User not found');

    // fetch book
    const bookDoc = await Book.findById(book).select('title author uid price');
    if (!bookDoc) return HttpResponse(res, 404, true, 'Book not found');

    if (bookDoc.uid && userDoc.uid && bookDoc.uid === userDoc.uid) {
      return HttpResponse(
        res,
        400,
        true,
        'This is your listing. You cannot add your own book to the cart'
      );
    }

    // Prevent duplicate cart item
    const existingCartItem = await Cart.findOne({ user, book });
    if (existingCartItem) {
      return HttpResponse(res, 409, true, 'Book already in cart');
    }

    // Create cart item
    const cartItem = await Cart.create({
      user,
      book,
      quantity: 1,
    });

    const populated = await cartItem.populate([
      { path: 'user', select: 'displayName email' },
      { path: 'book', select: 'title author price' },
    ]);

    return HttpResponse(res, 201, false, 'Book added to cart', populated);
  } catch (error) {
    console.error('AddProductToCart error:', error);
    return HttpResponse(
      res,
      500,
      true,
      error.message || 'Internal Server Error'
    );
  }
};

export const DeleteCartItem = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isObjectId(id)) {
      return HttpResponse(res, 400, true, 'Invalid cart item ID');
    }

    const deleted = await Cart.findByIdAndDelete(id);
    if (!deleted) {
      return HttpResponse(res, 404, true, 'Cart item not found');
    }

    return HttpResponse(res, 200, false, 'Cart item deleted successfully');
  } catch (error) {
    console.error('DeleteCartItem error:', error);
    return HttpResponse(res, 500, true, 'Internal Server Error');
  }
};
