import express from 'express';
import {
  CreateBook,
  DeleteBook,
  GetAllBooks,
  GetBookById,
  UpdateBook,
} from '../Controllers/BookController.js';

const router = express.Router();

router.get('/get-all-books', GetAllBooks);

router.get('/bookdetail/:id', GetBookById);

router.post('/', CreateBook);

router.put('/:id', UpdateBook);

router.delete('/:id', DeleteBook);

export default router;
