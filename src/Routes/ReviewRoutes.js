// routes/reviews.js
import express from 'express';


import {
  CreateReview,
  DeleteReview,
  GetBookReviews,
  GetUserReviews,
  UpdateReview,
} from '../Controllers/ReviewControllers.js';

const router = express.Router();


// GET: reviews for a specific book
router.get('/get-book-reviews/:id', GetBookReviews);

// GET: reviews by user (ObjectId) — moved to /user/:id to avoid conflicts
router.get('/user/:id', GetUserReviews);

// POST: create a review
router.post('/', CreateReview);

// DELETE: delete a review by id
router.delete('/:id', DeleteReview);

// PUT: update a review by id (rating/title/content only)
router.put('/:id', UpdateReview);

export default router;
