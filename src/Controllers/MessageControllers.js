import cloudinary from '../Config/cloudinary.js';
import Message from '../Models/Message.js';
import User from '../Models/User.js';
import { HttpResponse } from '../utils/HttpResponse.js';

// ✅ Get all users except the logged-in one (for sidebar)
export const GetUsersForSidebar = async (req, res) => {
  try {
    const { loggedInUserID } = req.params;

    // Fetch all users except the logged-in one
    const filteredUsers = await User.find({ _id: { $ne: loggedInUserID } });

    return HttpResponse(
      res,
      200,
      false,
      'Users fetched successfully',
      filteredUsers
    );
  } catch (error) {
    console.error(error);
    return HttpResponse(res, 500, true, 'Internal Server Error');
  }
};

// ✅ Get messages between two users
export const GetMessages = async (req, res) => {
  const { id: UserToChatId, myid } = req.params;

  try {
    const messages = await Message.find({
      $or: [
        { senderId: myid, receiverId: UserToChatId },
        { senderId: UserToChatId, receiverId: myid },
      ],
    }).sort({ createdAt: 1 });

    return HttpResponse(
      res,
      200,
      false,
      'Messages fetched successfully',
      messages
    );
  } catch (error) {
    console.error(error);
    return HttpResponse(res, 500, true, 'Internal Server Error');
  }
};

// ✅ Send message (text or image)
export const SendMessage = async (req, res) => {
  const { senderId, receiverId, text, image } = req.body;

  if (!text && !image)
    return HttpResponse(res, 400, true, 'No message content provided');

  try {
    let imageUrl;

    // If image is present, upload to Cloudinary
    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl,
    });

    await newMessage.save();

    // 🔜 TODO: Socket.io emit event here for real-time chat updates

    return HttpResponse(
      res,
      201,
      false,
      'Message created successfully',
      newMessage
    );
  } catch (error) {
    console.error(error);
    return HttpResponse(res, 500, true, 'Internal Server Error');
  }
};
