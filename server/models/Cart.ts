import mongoose, { Schema, Document } from 'mongoose';

export interface ICart extends Document {
  userId?: number;
  sessionId?: string;
  createdAt: Date;
}

const CartSchema: Schema = new Schema({
  userId: { type: Number },
  sessionId: { type: String },
  createdAt: { type: Date, default: Date.now }
});

// At least one of userId or sessionId must be present
CartSchema.pre('validate', function(next) {
  if (!this.userId && !this.sessionId) {
    this.invalidate('userId', 'Either userId or sessionId must be provided');
  }
  next();
});

export default mongoose.model<ICart>('Cart', CartSchema);