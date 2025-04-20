import mongoose, { Schema, Document } from 'mongoose';

export interface IBanner extends Document {
  title: string;
  subtitle?: string;
  imageUrl: string;
  linkUrl?: string;
  active: boolean;
  position: number;
}

const BannerSchema: Schema = new Schema({
  title: { type: String, required: true },
  subtitle: { type: String },
  imageUrl: { type: String, required: true },
  linkUrl: { type: String },
  active: { type: Boolean, default: true },
  position: { type: Number, default: 0 }
});

export default mongoose.model<IBanner>('Banner', BannerSchema);