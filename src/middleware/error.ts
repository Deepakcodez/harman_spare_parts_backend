import { Request, Response, NextFunction } from "express";
import { ErrorHandler } from "../utils/errorHandler";
import { MongoError } from "mongodb";

// Interface to extend ErrorHandler to handle MongoDB specific errors
interface MongoDBError extends ErrorHandler {
  code?: number;
  keyValue?: Record<string, any>;
}

const errorMiddleware = (
  err: MongoDBError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";

  // Handle Mongoose CastError (e.g., invalid ObjectId)
  if (err.name === "CastError") {
    const castErrorMessage = `Resource not found with id ${err.name}`;
    err = new ErrorHandler(castErrorMessage, 400);
  }

  // Handle MongoDB Duplicate Key Error (code 11000)
  if (err.code === 11000 && err.keyValue) {
    const key = Object.keys(err.keyValue)[0];
    const value = err.keyValue[key];
    const duplicateKeyMessage = `Duplicate value entered for ${key}: ${value}`;
    err = new ErrorHandler(duplicateKeyMessage, 400);
  }

  
  // json web toke error
  if (err.name ==="jsonWebToken") {
    
    const Message = `Json web token is Invalid`;
    err = new ErrorHandler(Message, 400);
  }


  // token expied error
  if (err.name ==="TokenExpiredError") {
    
    const Message = `Json web token is Invalid`;
    err = new ErrorHandler(Message, 400);
  }



  // Update status code and message from the modified error
  statusCode = err.statusCode || statusCode;
  message = err.message || message;

  res.status(statusCode).json({
    success: false,
    message: message,
  });
};

export default errorMiddleware;
