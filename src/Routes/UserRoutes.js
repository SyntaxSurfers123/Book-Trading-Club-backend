import express from 'express';
import User from '../Models/User.js';

const router = express.Router();

// Get All users
router.get('/', async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Internal Server Error', error: error.message });
  }
});

// Get user by uid
router.get('/:uid', async (req, res) => {
  try {
    const { uid } = req.params;
    if (!uid) {
      return res.status(400).json({ message: 'UID is required' });
    }
    const user = await User.findOne({ uid: uid });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Internal Server Error', error: error.message });
  }
});

// Get User Details with the post details

router.get('/:uid/favouritebooks', async (req, res) => {
  const user = await User.findOne({ uid: uid }).populate('book');
  if (!user) {
    return res.status(404).json({
      error: true,
      message: 'USER not found',
    });
  }
  res.status(200).json({
    error: false,
    data: user,
  });
});

// Create or update user
router.post('/', async (req, res) => {
  const { uid, email, displayName } = req.body;
  if (!uid || !email || !displayName) {
    return res
      .status(400)
      .json({ message: 'UID, email, and displayName are required' });
  }
  try {
    const existingUser = await User.findOne({ uid: uid });
    if (existingUser) {
      res.status(200).json({
      return res.status(200).json({
        error: false,
        message: 'User already exists',
        user: existingUser,
      });
    }
    const newUser = new User({ uid, email, displayName });
    await newUser.save();
    res
      .status(201)
      .json({ error: false, message: 'User created', user: newUser });
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Internal Server Error', error: error.message });
  }
});

// Delete user by uid
router.delete('/:uid', async (req, res) => {
  const { uid } = req.params;
  if (!uid) {
    return res.status(400).json({ message: 'UID is required' });
  }
  try {
    const existingUser = await User.findOne({ uid: uid });
    if (!existingUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    await User.deleteOne({ uid: uid });
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {}
});

// update user by uid
router.put('/:uid', async (req, res) => {
  const { uid } = req.params;
  const { email, displayName, favoriteBooks, role, image } = req.body;
  if (!uid) {
    return res.status(400).json({ message: 'UID is required' });
  }
  try {
    const existingUser = await User.findOne({ uid: uid });
    if (!existingUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (role) existingUser.role = role;
    if (email) existingUser.email = email;
    if (displayName) existingUser.displayName = displayName;
    if (favoriteBooks) existingUser.favoriteBooks = favoriteBooks;
    if (image) existingUser.image = image;
    await existingUser.save();
    res
      .status(200)
      .json({ message: 'User updated successfully', user: existingUser });
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Internal Server Error', error: error.message });
  }
});

export default router;
