import { appError } from "../interfaces/error.interface";

class AppError extends Error implements appError {
  statusCode: number;

  status: string;

  IsOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.IsOperational = true;

    Error.captureStackTrace(this, this.constructor); // prvent polution of the stack trace
  }
}

export default AppError;
