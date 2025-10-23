import Book from '../Models/Book.js';

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

export const UpdateBook = (req, res) => {
  const { id } = req.params;
  const body = req.body;
  res
    .status(201)
    .json({ message: `Book Put request working for id: ${id}`, body: body });
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

// Helper function to calculate distance between two coordinates using Haversine formula
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c; // Distance in kilometers
  return distance;
};

export const GetBooksByLocation = async (req, res) => {
  try {
    const { latitude, longitude, radius = 5 } = req.query;
    
    if (!latitude || !longitude) {
      return res.status(400).json({ 
        message: 'Latitude and longitude are required' 
      });
    }

    const userLat = parseFloat(latitude);
    const userLon = parseFloat(longitude);
    const radiusKm = parseFloat(radius);

    // Get all books with coordinates
    const allBooks = await Book.find({
      'coordinates.latitude': { $exists: true },
      'coordinates.longitude': { $exists: true }
    });

    // Filter books within the specified radius
    const nearbyBooks = allBooks.filter(book => {
      const bookLat = book.coordinates.latitude;
      const bookLon = book.coordinates.longitude;
      const distance = calculateDistance(userLat, userLon, bookLat, bookLon);
      return distance <= radiusKm;
    });

    res.status(200).json({
      books: nearbyBooks,
      count: nearbyBooks.length,
      userLocation: { latitude: userLat, longitude: userLon },
      radius: radiusKm
    });
  } catch (error) {
    console.error('Error in GetBooksByLocation:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};