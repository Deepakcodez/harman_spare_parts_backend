import { Request, Response } from "express";
import { ErrorHandler } from "../utils/errorHandler";
import User from "../model/user.model";
import { sendToken } from "../utils/JWTtoken";


// register user
export const register = async (req: Request, resp: Response): Promise<void> => {
  const { name, email, password } = req.body;
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
   
  sendToken(user,200,resp)

};



//login user
export const login = async (req: Request, resp: Response): Promise<void> => {
  const {  email, password } = req.body;
  if ( !email || !password) {
    throw new ErrorHandler("User credentials are not provided", 400);
  }
  
  const user = await User.findOne({email}).select("+password");
  
  if(!user){
    throw new ErrorHandler("User credentials are not provided", 401);
  }

  const isPasswordMatched = await user.comparePassword(password);

  if(!isPasswordMatched){
    throw new ErrorHandler("User credentials are not correct", 401);
  }
   
 sendToken(user,200,resp)
};
