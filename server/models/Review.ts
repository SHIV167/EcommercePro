import mongoose, { Schema, Document } from 'mongoose';

export interface IReview extends Document {
  userId: number;
  productId: number;
  rating: number;
  comment: string;
  createdAt: Date;
}

const ReviewSchema: Schema = new Schema({
  userId: { type: Number, required: true },
  productId: { type: Number, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

// Ensure one review per user per product
ReviewSchema.index({ userId: 1, productId: 1 }, { unique: true });

export default mongoose.model<IReview>('Review', ReviewSchema);