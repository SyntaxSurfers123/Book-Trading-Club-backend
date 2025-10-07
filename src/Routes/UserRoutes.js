import express from 'express';

const router = express.Router();

// Get user's favorite books
router.get('/:uid', async (req, res) => {
  try {
    const { uid } = req.params;
    console.log(`📖 Fetching favorites for user: ${uid}`);

    let user = await User.findOne({ uid });

    // If user doesn't exist, create them
    if (!user) {
      console.log(`👤 Creating new user: ${uid}`);
      user = new User({
        uid,
        email: req.query.email || 'unknown@example.com',
        favoriteBooks: [],
      });
      await user.save();
      console.log(`✅ User created successfully`);
    }

    console.log(
      `📚 Found ${user.favoriteBooks.length} favorites for user ${uid}`
    );
    res.json({
      success: true,
      favoriteBooks: user.favoriteBooks,
    });
  } catch (error) {
    console.error('❌ Error fetching favorites:', error);
    res.status(500).json({
      success: false,
      error: `Failed to fetch favorites: ${error.message}`,
    });
  }
});

// Add book to favorites
router.post('/:uid', async (req, res) => {
  try {
    const { uid } = req.params;
    const { bookId } = req.body;

    if (!bookId) {
      return res.status(400).json({
        success: false,
        error: 'Book ID is required',
      });
    }

    let user = await User.findOne({ uid });

    if (!user) {
      user = new User({
        uid,
        email: req.body.email || 'unknown@example.com',
        favoriteBooks: [bookId],
      });
    } else {
      // Only add if not already in favorites
      if (!user.favoriteBooks.includes(bookId)) {
        user.favoriteBooks.push(bookId);
      }
    }

    user.updatedAt = new Date();
    await user.save();

    res.json({
      success: true,
      message: 'Book added to favorites',
      favoriteBooks: user.favoriteBooks,
    });
  } catch (error) {
    console.error('Error adding to favorites:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add to favorites',
    });
  }
});

// Remove book from favorites
router.delete('/:uid/:bookId', async (req, res) => {
  try {
    const { uid, bookId } = req.params;

    const user = await User.findOne({ uid });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    user.favoriteBooks = user.favoriteBooks.filter((id) => id !== bookId);
    user.updatedAt = new Date();
    await user.save();

    res.json({
      success: true,
      message: 'Book removed from favorites',
      favoriteBooks: user.favoriteBooks,
    });
  } catch (error) {
    console.error('Error removing from favorites:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to remove from favorites',
    });
  }
});

// Toggle favorite (add if not present, remove if present)
router.put('/:uid/toggle', async (req, res) => {
  try {
    const { uid } = req.params;
    const { bookId } = req.body;

    console.log(`🔄 Toggling favorite for user ${uid}, book ${bookId}`);

    if (!bookId) {
      console.log('❌ Book ID is required');
      return res.status(400).json({
        success: false,
        error: 'Book ID is required',
      });
    }

    let user = await User.findOne({ uid });

    if (!user) {
      console.log(`👤 Creating new user: ${uid}`);
      user = new User({
        uid,
        email: req.body.email || 'unknown@example.com',
        favoriteBooks: [bookId],
      });
      await user.save();
      console.log(`✅ User created and book ${bookId} added to favorites`);

      return res.json({
        success: true,
        action: 'added',
        message: 'Book added to favorites',
        favoriteBooks: user.favoriteBooks,
      });
    }

    const isFavorite = user.favoriteBooks.includes(bookId);
    console.log(
      `📚 Book ${bookId} is currently ${
        isFavorite ? 'favorited' : 'not favorited'
      }`
    );

    if (isFavorite) {
      user.favoriteBooks = user.favoriteBooks.filter((id) => id !== bookId);
      user.updatedAt = new Date();
      await user.save();
      console.log(`✅ Book ${bookId} removed from favorites`);

      res.json({
        success: true,
        action: 'removed',
        message: 'Book removed from favorites',
        favoriteBooks: user.favoriteBooks,
      });
    } else {
      user.favoriteBooks.push(bookId);
      user.updatedAt = new Date();
      await user.save();
      console.log(`✅ Book ${bookId} added to favorites`);

      res.json({
        success: true,
        action: 'added',
        message: 'Book added to favorites',
        favoriteBooks: user.favoriteBooks,
      });
    }
  } catch (error) {
    console.error('❌ Error toggling favorite:', error);
    res.status(500).json({
      success: false,
      error: `Failed to toggle favorite: ${error.message}`,
    });
  }
});
