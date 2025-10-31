import express from 'express';
import {
  GetMessages,
  GetUsersForSidebar,
  SendMessage,
} from '../Controllers/MessageControllers.js';

const router = express.Router();

// ✅ Get all users except logged-in user (for sidebar)
router.get('/get-users/:loggedInUserID', GetUsersForSidebar);

// ✅ Get all messages between logged-in user and selected user
router.get('/get-messages/:id/:myid', GetMessages);

// ✅ Send a new message (text or image)
router.post('/', SendMessage);

export default router;
