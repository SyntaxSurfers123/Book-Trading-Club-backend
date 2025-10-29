import mongoose from 'mongoose';
import Order from '../Models/Order.js';
import Trade from '../Models/Trade.js';
import User from '../Models/User.js';
import Book from '../Models/Book.js';
import { HttpResponse } from '../utils/HttpResponse.js';

const isObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

export const CreateTrade = async (req, res) => {
  const { sender, senderbook, receiver, receiverbook } = req.body;

  try {
    // 1. Validate input
    if (!sender || !senderbook || !receiver || !receiverbook) {
      return HttpResponse(res, 400, true, 'All fields are required');
    }

    if (!isObjectId(sender) || !isObjectId(receiver)) {
      return HttpResponse(res, 400, true, 'Invalid Sender or Receiver ID');
    }

    if (!isObjectId(senderbook) || !isObjectId(receiverbook)) {
      return HttpResponse(res, 400, true, 'Invalid Sender or Receiver Book ID');
    }

    if (sender === receiver) {
      return HttpResponse(
        res,
        400,
        true,
        'Sender and Receiver cannot be the same user'
      );
    }

    // 2. Verify users exist
    const senderDoc = await User.findById(sender).select(
      'uid displayName email'
    );
    if (!senderDoc) return HttpResponse(res, 404, true, 'Sender not found');

    const receiverDoc = await User.findById(receiver).select(
      'uid displayName email'
    );
    if (!receiverDoc) return HttpResponse(res, 404, true, 'Receiver not found');

    // 3. Verify books exist
    const senderBookDoc = await Book.findById(senderbook).select(
      'title author uid price'
    );
    if (!senderBookDoc)
      return HttpResponse(res, 404, true, 'Sender book not found');

    const receiverBookDoc = await Book.findById(receiverbook).select(
      'title author uid price'
    );
    if (!receiverBookDoc)
      return HttpResponse(res, 404, true, 'Receiver book not found');

    // 4. Verify ownership
    // const senderOwnsBook = await Order.exists({
    //   user: sender,
    //   book: senderbook,
    // });
    // if (!senderOwnsBook) {
    //   return HttpResponse(
    //     res,
    //     400,
    //     true,
    //     'Sender does not own the selected book'
    //   );
    // }

    // const receiverOwnsBook = await Order.exists({
    //   user: receiver,
    //   book: receiverbook,
    // });
    // if (!receiverOwnsBook) {
    //   return HttpResponse(
    //     res,
    //     400,
    //     true,
    //     'Receiver does not own the selected book'
    //   );
    // }

    // 5. Prevent duplicate ownership
    const existingOrderSender = await Order.exists({
      user: sender,
      book: receiverbook,
    });
    if (existingOrderSender) {
      return HttpResponse(
        res,
        400,
        true,
        "Sender already owns the receiver's book"
      );
    }

    const existingReceiverOrder = await Order.exists({
      user: receiver,
      book: senderbook,
    });
    if (existingReceiverOrder) {
      return HttpResponse(
        res,
        400,
        true,
        "Receiver already owns the sender's book"
      );
    }

    // 6. Prevent duplicate trade requests
    const existingTrade = await Trade.exists({
      sender,
      receiver,
      senderbook,
      receiverbook,
      status: 'Requested',
    });
    if (existingTrade) {
      return HttpResponse(res, 400, true, 'Trade request already exists');
    }

    // 7. Create the trade
    const trade = await Trade.create({
      sender,
      receiver,
      senderbook,
      receiverbook,
    });

    return HttpResponse(res, 201, false, 'Trade created successfully', trade);
  } catch (error) {
    console.error(error);
    return HttpResponse(res, 500, true, 'Internal Server Error');
  }
};

// 📘 1. Get Requested Trades — trades *initiated by user*
export const GetRequestedTrades = async (req, res) => {
  const { userId } = req.params;

  if (!userId) return HttpResponse(res, 400, true, 'User ID is required');
  if (!isObjectId(userId))
    return HttpResponse(res, 400, true, 'Invalid User ID');

  try {
    const tradeRequests = await Trade.find({
      sender: userId,
      status: 'Requested',
    })
      .populate('sender', 'displayName email image')
      .populate('receiver', 'displayName email image')
      .populate('senderbook', 'title author price imageUrl')
      .populate('receiverbook', 'title author price imageUrl')
      .sort({ createdAt: -1 });

    return HttpResponse(
      res,
      200,
      false,
      'Requested trades fetched successfully',
      tradeRequests
    );
  } catch (error) {
    console.error(error);
    return HttpResponse(res, 500, true, 'Internal Server Error');
  }
};

// 📗 2. Get Accepted Trades — trades where user is sender or receiver, and status is "Accepted"
export const GetAcceptedTrades = async (req, res) => {
  const { userId } = req.params;

  if (!userId) return HttpResponse(res, 400, true, 'User ID is required');
  if (!isObjectId(userId))
    return HttpResponse(res, 400, true, 'Invalid User ID');

  try {
    // ✅ $or ensures we get trades where user is either sender OR receiver
    const acceptedTrades = await Trade.find({
      status: 'Accepted',
      $or: [{ sender: userId }, { receiver: userId }],
    })
      .populate('sender', 'displayName email image')
      .populate('receiver', 'displayName email image')
      .populate('senderbook', 'title author price imageUrl')
      .populate('receiverbook', 'title author price imageUrl')
      .sort({ updatedAt: -1 });

    return HttpResponse(
      res,
      200,
      false,
      'Accepted trades fetched successfully',
      acceptedTrades
    );
  } catch (error) {
    console.error(error);
    return HttpResponse(res, 500, true, 'Internal Server Error');
  }
};

// 🟨 3. Get Trade Request — trades where user is receiver , and status is "Requested"
export const GetTradeRequest = async (req, res) => {
  const { userId } = req.params;

  if (!userId) return HttpResponse(res, 400, true, 'User ID is required');
  if (!isObjectId(userId))
    return HttpResponse(res, 400, true, 'Invalid User ID');

  try {
    const tradeRequests = await Trade.find({
      receiver: userId,
      status: 'Requested',
    })
      .populate('sender', 'displayName email image')
      .populate('receiver', 'displayName email image')
      .populate('senderbook', 'title author price imageUrl')
      .populate('receiverbook', 'title author price imageUrl')
      .sort({ createdAt: -1 });

    return HttpResponse(
      res,
      200,
      false,
      'Trade requests received successfully',
      tradeRequests
    );
  } catch (error) {
    console.error(error);
    return HttpResponse(res, 500, true, 'Internal Server Error');
  }
};
