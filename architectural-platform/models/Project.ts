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
    ambientIntensity?: number;
    directionalIntensity?: number;
    lightColor?: string;
    scale?: number;
    rotation?: [number, number, number];
    position?: [number, number, number];
    backgroundColor?: string;
    materialMode?: 'solid' | 'wireframe';
    shadows?: boolean;
    cameraMode?: 'perspective' | 'orthographic';
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
      ambientIntensity: { type: Number, default: 0.5 },
      directionalIntensity: { type: Number, default: 1 },
      lightColor: { type: String, default: '#ffffff' },
      scale: { type: Number, default: 1 },
      rotation: { type: [Number], default: [0, 0, 0] },
      position: { type: [Number], default: [0, 0, 0] },
      backgroundColor: { type: String, default: '#f0f0f0' },
      materialMode: { type: String, enum: ['solid', 'wireframe'], default: 'solid' },
      shadows: { type: Boolean, default: true },
      cameraMode: { type: String, enum: ['perspective', 'orthographic'], default: 'perspective' },
    },
  },
  { timestamps: true }
);

export default mongoose.models.Project || mongoose.model<IProject>('Project', ProjectSchema);