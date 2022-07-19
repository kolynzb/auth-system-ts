import dotenv from 'dotenv-safe';
import { NextFunction, Request, Response } from 'express';
import AppError from '@src/utils/appError.util';
import { appError } from '@src/interfaces/error.interface';

dotenv.config();

const { NODE_ENV } = process.env;

// handle invalid db ids
const handleCastErrorDB = (err: any) => new AppError(`Invalid ${err.path} : ${err.value}`, 400);

const handleDuplicateErrorDB = (err: any) => {
  // regex to find the value in quotes
  const value = err.errmsg.match(/(["'])(?:(?=(\\?))\2.)*?\1/)[0];
  return new AppError(`Duplicate field value of ${value}`, 400);
};

const handleValidationErrorDB = (err: any) => {
  const errors = Object.values(err.errors).map((val: any) => val.message);
  // handling invalid input data
  return new AppError(`invalid input data. ${errors.join('. ')}`, 400);
};

const handleJWTError = () => new AppError('Invalid token please login again', 400);

const handleJWTExpiredError = () => new AppError('Token has expired please login again', 400);

const sendErrDev = (err: any, res: Response) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    error: err,
    stack: err.stack,
  });
};

const sendErrProd = (err: appError, res: Response) => {
  if (err.IsOperational) {
    res.status(500).json({
      status: err.status,
      message: err.message,
    });
  } else {
    // programming errors should not leak details
    console.error('Error 💥💥', err);

    res.status(err.statusCode).json({
      status: 'error',
      message: 'Something went wrong',
    });
  }
};

export default (err: appError, req: Request, res: Response, next: NextFunction): void => {
  err.status = err.status || 'error';
  err.statusCode = err.statusCode || 500;

  if (NODE_ENV === 'production') {
    let error = { ...err };
    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateErrorDB(error);
    if (error.name === 'ValidationError') error = handleValidationErrorDB(error);
    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();

    sendErrProd(error, res);
  } else if (NODE_ENV === 'development') {
    sendErrDev(err, res);
  }
};
