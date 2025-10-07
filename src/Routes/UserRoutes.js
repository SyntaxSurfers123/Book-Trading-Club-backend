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
router.get('/:uid', (req, res) => {
  const { uid } = req.params;
  res.send(`Get user with UID: ${uid} - To be implemented`);
});

// Create or update user
router.post('/', (req, res) => {
  res.send('Create or update user - To be implemented');
});

// Delete user by uid
router.delete('/:uid', (req, res) => {
  const { uid } = req.params;
  res.send(`Delete user with UID: ${uid} - To be implemented`);
});

export default router;
