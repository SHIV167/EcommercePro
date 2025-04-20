import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  id: number;
  name: string;
  email: string;
  password: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  phone?: string;
  isAdmin: boolean;
  createdAt: Date;
}

const UserSchema: Schema = new Schema({
  id: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  address: { type: String },
  city: { type: String },
  state: { type: String },
  zipCode: { type: String },
  phone: { type: String },
  isAdmin: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<IUser>('User', UserSchema);