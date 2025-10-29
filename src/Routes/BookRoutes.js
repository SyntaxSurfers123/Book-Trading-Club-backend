import express from 'express';
import {
  CreateBook,
  DeleteBook,
  GetAllBooks,
  GetBookById,
  GetBooksByLocation,
  GetUserBooks,
  UpdateBook,
} from '../Controllers/BookController.js';

const router = express.Router();

router.get('/', GetAllBooks);

router.get('/location', GetBooksByLocation);

router.get('/:id', GetBookById);

router.get('/get-user-books/:uid', GetUserBooks);

router.post('/', CreateBook);

router.put('/:id', UpdateBook);

router.delete('/:id', DeleteBook);

export default router;
