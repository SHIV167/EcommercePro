import mongoose, { Schema, Document } from 'mongoose';

export interface IOrder extends Document {
  userId: number;
  status: string;
  totalAmount: number;
  shippingAddress: string;
  paymentMethod: string;
  paymentStatus: string;
  createdAt: Date;
}

const OrderSchema: Schema = new Schema({
  userId: { type: Number, required: true },
  status: { type: String, required: true, default: 'pending' },
  totalAmount: { type: Number, required: true },
  shippingAddress: { type: String, required: true },
  paymentMethod: { type: String, required: true },
  paymentStatus: { type: String, required: true, default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<IOrder>('Order', OrderSchema);