import mongoose, { Schema, Document } from 'mongoose';

export interface IOrderItem extends Document {
  orderId: number;
  productId: number;
  quantity: number;
  price: number;
}

const OrderItemSchema: Schema = new Schema({
  orderId: { type: Number, required: true },
  productId: { type: Number, required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true }
});

export default mongoose.model<IOrderItem>('OrderItem', OrderItemSchema);