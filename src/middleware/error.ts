import { Request, Response, NextFunction } from 'express';
import { ErrorHandler } from '../utils/errorHandler';

const error = (err: ErrorHandler, req: Request, res: Response, next: NextFunction): void => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || 'Internal Server Error';

  res.status(err.statusCode).json({
    success: false,
    error: {
      message: err.message,
    },
  });
};

export default error;
