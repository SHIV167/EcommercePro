import mongoose, { Schema, Document } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  description: string;
  shortDescription?: string;
  price: number;
  discountedPrice?: number;
  imageUrl: string;
  stock: number;
  rating?: number;
  totalReviews?: number;
  slug: string;
  categoryId: number;
  featured: boolean;
  bestseller: boolean;
  isNew: boolean;
  createdAt: Date;
}

const ProductSchema: Schema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  shortDescription: { type: String },
  price: { type: Number, required: true },
  discountedPrice: { type: Number },
  imageUrl: { type: String, required: true },
  stock: { type: Number, required: true, default: 0 },
  rating: { type: Number, default: 0 },
  totalReviews: { type: Number, default: 0 },
  slug: { type: String, required: true, unique: true },
  categoryId: { type: Number, required: true },
  featured: { type: Boolean, default: false },
  bestseller: { type: Boolean, default: false },
  isNew: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<IProduct>('Product', ProductSchema);