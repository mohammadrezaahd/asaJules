import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  passwordHash?: string;
  avatarUrl?: string;
  role: 'ADMIN' | 'USER' | 'STUDENT' | 'COLLEAGUE';
  provider: 'credentials' | 'google';
  providerId?: string;
  bookmarks: {
    projects: mongoose.Schema.Types.ObjectId[];
    articles: mongoose.Schema.Types.ObjectId[];
  };
  collaborations: mongoose.Schema.Types.ObjectId[];
}

const UserSchema: Schema = new Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String },
    avatarUrl: { type: String },
    role: {
      type: String,
      enum: ['ADMIN', 'USER', 'STUDENT', 'COLLEAGUE'],
      default: 'USER',
    },
    provider: {
      type: String,
      enum: ['credentials', 'google'],
      required: true,
    },
    providerId: { type: String },
    bookmarks: {
      projects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Project' }],
      articles: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Article' }],
    },
    collaborations: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Project' }],
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);