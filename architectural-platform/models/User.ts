import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  name: string;
  surname: string;
  username: string;
  email: string;
  password?: string;
  avatar?: string;
  role: 'ADMIN' | 'USER' | 'STUDENT' | 'COLLEAGUE';
  authProvider: 'manual' | 'google';
  bookmarks: {
    projects: mongoose.Schema.Types.ObjectId[];
    articles: mongoose.Schema.Types.ObjectId[];
  };
}

const UserSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    surname: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    avatar: { type: String },
    role: {
      type: String,
      enum: ['ADMIN', 'USER', 'STUDENT', 'COLLEAGUE'],
      default: 'USER',
    },
    authProvider: {
      type: String,
      enum: ['manual', 'google'],
      required: true,
    },
    bookmarks: {
      projects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Project' }],
      articles: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Article' }],
    },
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);