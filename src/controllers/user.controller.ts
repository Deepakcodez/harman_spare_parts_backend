import { Request, Response } from "express";
import { ErrorHandler } from "../utils/errorHandler";
import User from "../model/user.model";

export const register = async (req: Request, res: Response): Promise<void> => {
  const { name, email, password } = req.body;
  console.log(">>>>>>>>>>>", name);
  if (!name || !email || !password) {
    throw new ErrorHandler("User credentials are not provided", 400);
  }
  const user = await User.create({
    name,
    email,
    password,
    avatar: {
      public_id: "this is public is",
      url: "this is url",
    },
  });
   
  const token = user.getJWTToken();

  res.status(201).json({
    success: true,
    user,
    token,
  });
};
