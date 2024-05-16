import mongoose, { Schema, Document, Model } from "mongoose";

interface Image {
  public_id: string;
  url: string;
}
interface UserDocument extends Document {
  name: string;
  email: string;
  password: string;
  images: Image[];
}

const userSchema = new mongoose.Schema<UserDocument>(
  {
    name: {
      type: String,
      minlength: 2,
      trim: true,
      lowercase: true,
      required: true,
    },

    email: {
      type: String,
      required: [true, "please provide email"],
      unique: true,
    },

    password: {
      type: String,
      minlength: [6, "password must be  at least 6 characters"],
      required: [true, "please enter password"],
    },

    images: [
      {
        public_id: {
          type: String,
          required: true,
        },
        url: {
          type: String,
          required: true,
        },
      },
    ],
  },
  { timestamps: true }
);

const User: Model<UserDocument> = mongoose.model<UserDocument>(
  "User",
  userSchema
);
export default User;
