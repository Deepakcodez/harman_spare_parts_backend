import mongoose, { Schema, Document, Model } from "mongoose";
import validator from "validator";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

interface Avatar {
  public_id: string;
  url: string;
}

interface UserDocument extends Document {
  name: string;
  email: string;
  password: string;
  avatar: Avatar;
  role: string;
  resetPasswordToken?: string;
  resetPasswordExpire?: Date;
  getJWTToken: () => string;
}

const userSchema = new Schema<UserDocument>(
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
      required: [true, "Please provide an email"],
      unique: true,
      validate: [validator.isEmail, "Please enter a valid email"],
    },
    password: {
      type: String,
      minlength: [6, "Password must be at least 6 characters"],
      required: [true, "Please enter a password"],
    },
    avatar: {
      public_id: {
        type: String,
        required: true,
      },
      url: {
        type: String,
        required: true,
      },
    },
    role: {
      type: String,
      default: "user",
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  { timestamps: true }
);

userSchema.pre<UserDocument>("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.getJWTToken = function (): string {
  console.log('>>>>>>>>>>>',  process.env.JWT_SECRET)
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET as string, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

const User: Model<UserDocument> = mongoose.model<UserDocument>("User", userSchema);
export default User;
