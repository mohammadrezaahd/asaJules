import mongoose, { Document, Schema } from 'mongoose';

export interface IMedia extends Document {
  name: string;
  type: 'image' | 'video' | 'model' | 'document';
  size: number;
  path: string;
  uploadedBy: mongoose.Schema.Types.ObjectId;
}

const MediaSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    type: {
      type: String,
      enum: ['image', 'video', 'model', 'document'],
      required: true,
    },
    size: { type: Number, required: true },
    path: { type: String, required: true },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

export default mongoose.models.Media || mongoose.model<IMedia>('Media', MediaSchema);