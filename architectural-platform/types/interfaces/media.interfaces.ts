import { User } from "./user.interfaces";

export interface MediaFile {
  _id: string;
  filename: string;
  filepath: string;
  mimetype: string;
  size: number;
  uploadedBy: User;
  createdAt: string;
  updatedAt: string;
}

export interface UploadResponse {
  _id: string;
  filename: string;
  filepath: string;
  mimetype: string;
  size: number;
  uploadedBy: string; // This will be the user ID
  createdAt: string;
  updatedAt: string;
}
