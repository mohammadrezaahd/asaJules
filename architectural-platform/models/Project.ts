import mongoose, { Document, Schema } from 'mongoose';

export interface IProject extends Document {
  title: string;
  category: mongoose.Schema.Types.ObjectId;
  description: string;
  thumbnail: mongoose.Schema.Types.ObjectId;
  gallery: mongoose.Schema.Types.ObjectId[];
  model: mongoose.Schema.Types.ObjectId;
  contributors: mongoose.Schema.Types.ObjectId[];
  tags: string[];
  status: 'Draft' | 'Published';
  modelConfig?: {
    cameraPosition?: [number, number, number];
    lighting?: {
      intensity?: number;
    };
  };
}

const ProjectSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    description: { type: String, required: true },
    thumbnail: { type: mongoose.Schema.Types.ObjectId, ref: 'Media', required: true },
    gallery: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Media' }],
    model: { type: mongoose.Schema.Types.ObjectId, ref: 'Media', required: true },
    contributors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    tags: [{ type: String }],
    status: { type: String, enum: ['Draft', 'Published'], default: 'Draft' },
    modelConfig: {
      cameraPosition: { type: [Number], default: [0, 0, 5] },
      lighting: {
        intensity: { type: Number, default: 1 },
      },
    },
  },
  { timestamps: true }
);

export default mongoose.models.Project || mongoose.model<IProject>('Project', ProjectSchema);