import { NextFunction, Request, Response } from "express";
import asyncHandler from "./asyncHandler";
import { ErrorHandler } from "../utils/errorHandler";
import jwt from "jsonwebtoken";
import User, { UserDocument } from "../model/user.model";

// Extend the Request interface to include user
interface AuthenticatedRequest extends Request {
  user?: UserDocument | null;
}

// Augment the Request interface with the user property
declare global {
    namespace Express {
      interface Request {
        user?: UserDocument | null;
      }
    }
  }

export const isAuthenticatedUser = asyncHandler(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const  token  = req.cookies.token || req.headers.authorization;

    console.log(">>>>>>>>>>>from server middleware", token,req.cookies.token, req.headers.authorization);

    if (!token) {
      return next(new ErrorHandler("Please login to access", 401));
    }

    const decodedData = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as jwt.JwtPayload & { id: string };

    req.user = await User.findById(decodedData.id);
    if (!req.user) {
      return next(new ErrorHandler("User not found", 404));
    }
    next();
  }
);

export const logout = asyncHandler(async (req: Request, resp: Response) => {
  resp.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });

  resp.status(200).json({
    success: true,
    message: "Logged out",
  });
});

export const authorizedRole = (...roles: string[]) => {
    return (req: Request, resp: Response, next: NextFunction) => {
        console.log('>>>>>>>>>>>', req.user)
      if (!req.user || !roles.includes(req.user.role)) {
        return next(
          new ErrorHandler(
            `Role ${req.user?.role} is not allow this resource`,
            403
          )
        );
      }
      next();
    };
  };