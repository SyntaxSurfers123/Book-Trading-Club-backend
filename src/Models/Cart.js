import mongoose, { Schema } from 'mongoose';

const CartSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    book: {
      type: Schema.Types.ObjectId,
      ref: 'Book',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Cart = mongoose.model('Cart', CartSchema, 'cart');
export default Cart;
