import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  name?: string;
  email: string;
  image?: string;
  role: 'admin' | 'user';
  createdAt: Date;
  updatedAt: Date;
  
  // Firebase Auth fields
  uid: string;
  displayName?: string;
  photoURL?: string;
}

const UserSchema = new Schema<IUser>(
  {
    // Optional name field for backward compatibility
    name: {
      type: String,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    // Optional image field for backward compatibility
    image: {
      type: String,
    },
    role: {
      type: String,
      enum: ['admin', 'user'],
      default: 'user',
    },
    // Firebase Auth fields
    uid: {
      type: String,
      required: [true, 'Firebase UID is required'],
      unique: true,
    },
    displayName: {
      type: String,
    },
    photoURL: {
      type: String,
    },
  },
  { timestamps: true }
);

// Check if model already exists to prevent overwriting
const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User; 