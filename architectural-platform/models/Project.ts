import mongoose, { Document, Schema } from 'mongoose';

export interface IProject extends Document {
  title: string;
  name?: string; // For compatibility
  category?: mongoose.Schema.Types.ObjectId;
  description: string;
  thumbnail: string; // String for URL
  thumbnailUrl?: string; // For compatibility
  gallery?: string[]; // String array for URLs  
  images?: string[]; // For compatibility
  modelUrl: string; // URL string
  contributors?: mongoose.Schema.Types.ObjectId[];
  collaborators?: mongoose.Schema.Types.ObjectId[]; // For compatibility
  tags?: string[];
  status?: 'Draft' | 'Published';
  createdBy?: mongoose.Schema.Types.ObjectId;
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
    name: { type: String }, // For compatibility
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' }, // Remove required
    description: { type: String, required: true },
    thumbnail: { type: String, required: true }, // Changed to String for URL
    thumbnailUrl: { type: String }, // For compatibility
    gallery: [{ type: String }], // Changed to String array for URLs
    images: [{ type: String }], // For compatibility
    modelUrl: { type: String, required: true }, // Required URL field
    contributors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    collaborators: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // For compatibility
    tags: [{ type: String }],
    status: { type: String, enum: ['Draft', 'Published'], default: 'Draft' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
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

// Clear any cached model to force recompilation
if (mongoose.models.Project) {
  delete mongoose.models.Project;
}

export default mongoose.model<IProject>('Project', ProjectSchema);