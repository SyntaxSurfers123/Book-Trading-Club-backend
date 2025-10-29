import Book from '../Models/Book.js';
import { HttpResponse } from '../utils/HttpResponse.js';

export const GetAllBooks = async (req, res) => {
  try {
    const books = await Book.find();
    res.status(200).json(books);
  } catch (error) {
    console.error('Error in GetAllBooks:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const GetBookById = async (req, res) => {
  try {
    const { id } = req.params;
    const book = await Book.findById(id);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    res.status(200).json(book);
  } catch (error) {
    console.error('Error in GetBookById:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const GetUserBooks = async (req, res) => {
  try {
    const { uid } = req.params;
    if (!uid) {
      return res.status(400).json({ message: 'UID is required' });
    }
    const books = await Book.find({ uid: uid });
    res.status(200).json(books);
  } catch (error) {
    console.error('Error in GetUserBooks:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const GetBooksbyLocation = async (req, res) => {
  const { location } = req.params;
  if (!location) return HttpResponse(res, 400, true, 'Location is required');
  try {
    const books = await Book.find({ Location: location, Exchange: 'Swap' });
    return HttpResponse(
      res,
      200,
      false,
      'Book Fetched by location successfully',
      books
    );
  } catch (error) {
    console.error(error);
    return HttpResponse(res, 500, true, 'Internal Server Error');
  }
};

export const CreateBook = async (req, res) => {
  try {
    const {
      title,
      author,
      category,
      ISBN,
      Location,
      Condition,
      Exchange,
      Language,
      tags,
      price,
      description,
      imageUrl,
      uid,
    } = req.body;
    if (
      !uid ||
      !title ||
      !author ||
      !category ||
      !price ||
      !description ||
      !imageUrl ||
      !ISBN ||
      !Location ||
      !Condition ||
      !Exchange ||
      !Language ||
      !tags
    ) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    const newBook = new Book({
      title,
      author,
      category,
      price,
      description,
      imageUrl,
      uid,
      ISBN,
      Location,
      Condition,
      Exchange,
      Language,
      tags,
    });
    await newBook.save();
    res
      .status(201)
      .json({ message: 'Book Created Successfully', book: newBook });
  } catch (error) {
    console.error('Error in CreateBook:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const UpdateBook = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Validate id and data
    if (!id) {
      return res.status(400).json({ message: 'Book ID is required' });
    }

    if (!updates || Object.keys(updates).length === 0) {
      return res.status(400).json({ message: 'No data provided for update' });
    }

    // Find and update the book
    const updatedBook = await Book.findByIdAndUpdate(id, updates, {
      new: true, // returns the updated document
      runValidators: true, // ensures Mongoose validation rules still apply
    });

    // If not found
    if (!updatedBook) {
      return res.status(404).json({ message: 'Book not found' });
    }

    res.status(200).json({
      message: 'Book updated successfully',
      book: updatedBook,
    });
  } catch (error) {
    console.error('Error in UpdateBook:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const DeleteBook = async (req, res) => {
  const { id } = req.params;
  try {
    const BookDelete = await Book.findByIdAndDelete(id);
    if (!BookDelete) {
      return res.status(404).json({ message: 'Book not found' });
    }
    res.status(200).json({ message: 'Book Deleted Successfully' });
  } catch (error) {
    console.error('Error in DeleteBook:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
