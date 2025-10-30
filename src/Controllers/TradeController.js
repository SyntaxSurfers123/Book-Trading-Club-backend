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

    // 4. Prevent duplicate ownership
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

    // 5. Prevent duplicate trade requests
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

    // 6. Create the trade
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

// 🟥 4. Get Rejected Trades — trades where user is sender or receiver, and status is "Rejected"
export const GetRejectedTrades = async (req, res) => {
  const { userId } = req.params;

  if (!userId) return HttpResponse(res, 400, true, 'User ID is required');
  if (!isObjectId(userId))
    return HttpResponse(res, 400, true, 'Invalid User ID');

  try {
    // ✅ $or ensures we get trades where user is either sender OR receiver
    const rejectedTrades = await Trade.find({
      status: 'Rejected',
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
      'Rejected trades fetched successfully',
      rejectedTrades
    );
  } catch (error) {
    console.error(error);
    return HttpResponse(res, 500, true, 'Internal Server Error');
  }
};

// 🟥 5. Reject a Trade, changing the trade status from "Requested" to "Rejected"
export const RejectTrade = async (req, res) => {
  const { id } = req.params;
  if (!id) return HttpResponse(res, 400, true, 'Trade ID is required');
  if (!isObjectId(id)) return HttpResponse(res, 400, true, 'Invalid Trade ID');
  try {
    const ExistingTrade = await Trade.findOne({ _id: id });
    if (!ExistingTrade) return HttpResponse(res, 404, true, 'Trade Not Found');
    ExistingTrade.status = 'Rejected';
    await ExistingTrade.save();
    return HttpResponse(
      res,
      202,
      false,
      'Trade Rejected Successfully',
      ExistingTrade
    );
  } catch (error) {
    console.error(error);
    return HttpResponse(res, 500, true, 'Internal Server Error');
  }
};
// 🟩 6. Accept a Trade, changing the trade status from "Requested" to "Accepted". Create 2 orders and send them to the DB
export const AcceptTrade = async (req, res) => {
  const { id } = req.params;
  if (!id) return HttpResponse(res, 400, true, 'Trade ID is required');
  if (!isObjectId(id)) return HttpResponse(res, 400, true, 'Invalid Trade ID');
  try {
    const ExistingTrade = await Trade.findOne({ _id: id });
    if (!ExistingTrade) return HttpResponse(res, 404, true, 'Trade Not Found');
    // 1. Create an Order where the user is the receiver and the book is the senderbook
    const order1 = new Order({
      user: ExistingTrade.receiver,
      book: ExistingTrade.senderbook,
    });
    const order2 = new Order({
      user: ExistingTrade.sender,
      book: ExistingTrade.receiverbook,
    });

    ExistingTrade.status = 'Accepted';

    await order1.save();
    await order2.save();
    await ExistingTrade.save();
    return HttpResponse(res, 202, false, 'Trade Accepted Successfully', [
      ExistingTrade,
      order1,
      order2,
    ]);
  } catch (error) {
    console.error(error);
    return HttpResponse(res, 500, true, 'Internal Server Error');
  }
};
