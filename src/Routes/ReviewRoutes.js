// routes/reviews.js
import express from 'express';
import mongoose from 'mongoose';
import Review from '../Models/Review.js';
import User from '../Models/User.js';
import { HttpResponse } from '../utils/HttpResponse.js';

const router = express.Router();
const isObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// GET: reviews for a specific book
router.get('/get-book-reviews/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!isObjectId(id)) {
      return HttpResponse(res, 400, true, 'Invalid book ID');
    }

    const reviews = await Review.find({ book: id })
      .sort('-createdAt')
      .populate([
        { path: 'user', select: 'displayName email _id' },
        { path: 'book', select: 'title author _id' },
      ]);

    return HttpResponse(
      res,
      200,
      false,
      'Fetched Book reviews successfully',
      reviews
    );
  } catch (error) {
    return HttpResponse(res, 500, true, 'Internal Server Error');
  }
});

// GET: reviews by user (ObjectId) — moved to /user/:id to avoid conflicts
router.get('/user/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!isObjectId(id)) {
      return HttpResponse(res, 400, true, 'Invalid user ID');
    }

    const ExistingUser = await User.exists({ _id: id });
    if (!ExistingUser) return HttpResponse(res, 404, true, 'User not Found');

    const reviews = await Review.find({ user: id })
      .sort('-createdAt')
      .populate([
        { path: 'user', select: 'displayName email' },
        { path: 'book', select: 'title author' },
      ]);

    return HttpResponse(
      res,
      200,
      false,
      'Fetched User reviews successfully',
      reviews
    );
  } catch (error) {
    return HttpResponse(res, 500, true, 'Internal Server Error');
  }
});

// POST: create a review
router.post('/', async (req, res) => {
  try {
    const { user, book, rating, title, content } = req.body;

    // Basic required fields
    if (!user || !book || rating == null || !title || !content) {
      return HttpResponse(res, 400, true, 'All fields are required');
    }
    if (!isObjectId(user) || !isObjectId(book)) {
      return HttpResponse(res, 400, true, 'Invalid user or book id');
    }

    // Ensure user exists (and is the canonical FK)
    const userExists = await User.exists({ _id: user });
    if (!userExists) {
      return HttpResponse(res, 404, true, 'User not found');
    }

    // Create review
    const review = await Review.create({
      user,
      book,
      rating,
      title,
      content,
    });
    const populated = await review.populate([
      { path: 'user', select: 'displayName email' },
      { path: 'book', select: 'title author' },
    ]);

    return HttpResponse(
      res,
      201,
      false,
      'Review created successfully',
      populated
    );
  } catch (error) {
    // Handle unique index violation (user+book)
    if (error?.code === 11000) {
      return HttpResponse(
        res,
        400,
        true,
        'You have already reviewed this book'
      );
    }
    return HttpResponse(res, 400, true, error.message || 'Bad Request');
  }
});

// DELETE: delete a review by id
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!isObjectId(id)) {
      return HttpResponse(res, 400, true, 'Invalid review id');
    }

    const deleted = await Review.findByIdAndDelete(id);
    if (!deleted) {
      return HttpResponse(res, 404, true, 'Review not found');
    }

    return HttpResponse(res, 200, false, 'Review deleted successfully');
  } catch (error) {
    return HttpResponse(res, 500, true, 'Internal Server Error');
  }
});

// PUT: update a review by id (rating/title/content only)
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!isObjectId(id)) {
      return HttpResponse(res, 400, true, 'Invalid review id');
    }

    const allowed = ['rating', 'title', 'content'];
    const update = Object.fromEntries(
      Object.entries(req.body).filter(
        ([k, v]) => allowed.includes(k) && v !== undefined
      )
    );

    if (Object.keys(update).length === 0) {
      return HttpResponse(res, 400, true, 'No valid fields to update');
    }

    const updated = await Review.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true,
    }).populate([
      { path: 'user', select: 'displayName email' },
      { path: 'book', select: 'title author' },
    ]);

    if (!updated) {
      return HttpResponse(res, 404, true, 'Review not found');
    }

    return HttpResponse(
      res,
      200,
      false,
      'Review updated successfully',
      updated
    );
  } catch (error) {
    return HttpResponse(res, 400, true, error.message || 'Bad Request');
  }
});

export default router;
