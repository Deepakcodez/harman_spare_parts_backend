import { NextFunction, Request, Response } from "express";
import { ErrorHandler } from "../utils/errorHandler";
import User from "../model/user.model";
import { sendToken } from "../utils/JWTtoken";
import { sendEmail } from "../utils/sendEmail";

// register user
export const register = async (req: Request, resp: Response, next:NextFunction): Promise<void> => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return next(new ErrorHandler("User credentials are not provided", 400)) ;
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
export const login = async (req: Request, resp: Response,next:NextFunction): Promise<void> => {
  const {  email, password } = req.body;
  if ( !email || !password) {
    return next(new ErrorHandler("User credentials are not provided", 400)) ;
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


export const forgetpassword = async (req: Request, resp: Response,next:NextFunction): Promise<void> => {

   const user = await User.findOne({email : req.body.email});

   if(!user){
    return next(new ErrorHandler("user not found",404));
   }

   //get reset password token
   const resetToken = user.getResetPasswordToken()
   await user.save({ validateBeforeSave : false})
   

   const resetPasswordURL = `${req.protocol}://${req.get("host")}/api/v1/password/reset/${resetToken}`;

   const message = `your password reset token is :- \n\n ${resetPasswordURL}\n\n if you have not request this than ignore it`;

   try {

    await sendEmail({
           email : user.email,
           subject : `Password recovery`,
           message 
    })

    resp.status(200).json({
      success : true,
      message : `Email sent to ${user.email} successfully`
    })
    
   } catch (error:any) {

    user.resetPasswordExpire = undefined;
    user.resetPasswordToken = undefined;

    await user.save({ validateBeforeSave : false});

    return next(new ErrorHandler(error.message, 500))
    
   }
};

