import Message from '../Models/Message.js';
import User from '../Models/User.js';
import { HttpResponse } from '../utils/HttpResponse.js';

export const GetUsersForSidebar = async (req, res) => {
  try {
    const { loggedInUserID } = req.params;
    const filteredUsers = await User.find({ _id: { $ne: loggedInUserID } });
    return HttpResponse(
      res,
      200,
      false,
      'Users fetched Successfully',
      filteredUsers
    );
  } catch (error) {
    console.error(error);
    return HttpResponse(res, 500, true, 'Internal Server Error');
  }
};

export const GetMessages = async (req, res) => {
  const { myid } = req.body;
  const { id: UsertoChatId } = req.params;
  try {
    const messages = await Message.find({
      $or: [
        { senderId: myid, receiverId: UsertoChatId },
        { senderId: UsertoChatId, receiverId: myid },
      ],
    });
    return HttpResponse(
      res,
      200,
      false,
      'Messages Fetched Successfully',
      messages
    );
  } catch (error) {
    console.error(error);
    return HttpResponse(res, 500, true, 'Internal Server Error');
  }
};

export const SendMessage = async (req, res) => {
  const { senderId, receiverId, text, image } = req.body;
  let imageUrl;
  if (image)
};
