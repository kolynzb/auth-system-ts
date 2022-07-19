export interface appError extends Error {
  statusCode: number;

  status: string;

  IsOperational: boolean;

  code?: number;
}
