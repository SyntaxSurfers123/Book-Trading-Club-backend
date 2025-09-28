import mongoose from 'mongoose';
// Initial Model of Book. Subject to change
const BookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);
const Book = mongoose.model('Book', BookSchema);
export default Book;
