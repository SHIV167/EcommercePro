import mongoose, { Schema, Document } from 'mongoose';

export interface ICartItem extends Document {
  cartId: string;
  productId: string;
  quantity: number;
}

const CartItemSchema: Schema = new Schema({
  cartId: { type: String, required: true },
  productId: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 }
});

// Ensure one product per cart
CartItemSchema.index({ cartId: 1, productId: 1 }, { unique: true });

export default mongoose.model<ICartItem>('CartItem', CartItemSchema);