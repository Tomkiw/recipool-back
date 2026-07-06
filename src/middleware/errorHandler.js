import { HttpError } from 'http-errors';
import multer from 'multer';

export const errorHandler = (err, req, res, next) => {
  console.error('Error Middleware:', err);
  if (err instanceof HttpError) {
    return res.status(err.status).json({
      message: err.message || err.name,
    });
  }

  if (err instanceof multer.MulterError) {
    const status = err.code === 'LIMIT_FILE_SIZE' ? 413 : 400;
    return res.status(status).json({ message: err.message });
  }

  const isProd = process.env.NODE_ENV === 'production';

  res.status(500).json({
    message: isProd ? 'Something went wrong. Please try again later.' : err.message,
  });
};
