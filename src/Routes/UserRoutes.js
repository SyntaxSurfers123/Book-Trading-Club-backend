import express from 'express';

const router = express.Router();

// Get All users
router.get('/', (req, res) => {
  res.send('Get all users - To be implemented');
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
