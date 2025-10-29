import express from 'express';
import {
  CreateBook,
  DeleteBook,
  GetAllBooks,
  GetBookById,
  GetBooksbyLocation,
  GetUserBooks,
  UpdateBook,
} from '../Controllers/BookController.js';

const router = express.Router();

router.get('/', GetAllBooks);

router.get('/:id', GetBookById);

router.get('/get-user-books/:uid', GetUserBooks);

router.get('/get-books-by-location/:location', GetBooksbyLocation);

router.post('/', CreateBook);

router.put('/:id', UpdateBook);

router.delete('/:id', DeleteBook);

export default router;
