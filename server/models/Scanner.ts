import mongoose, { Schema, Document } from "mongoose";

export interface IScanner extends Document {
  data: string;
  productId?: string;
  scannedAt: Date;
}

const ScannerSchema: Schema = new Schema({
  data: { type: String, required: true },
  productId: { type: String },
  scannedAt: { type: Date, default: Date.now },
});

const ScannerModel = mongoose.model<IScanner>("Scanner", ScannerSchema);

export default ScannerModel;
