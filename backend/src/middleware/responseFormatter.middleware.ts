import { Request, Response, NextFunction } from 'express';

/**
 * Response formatter middleware that enforces a consistent response structure
 * All responses will be formatted as:
 * {
 *   success: boolean,
 *   message: string,
 *   data?: any,
 *   error?: any
 * }
 */
export const responseFormatter = (
  _req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Store the original json method
  const originalJson = res.json.bind(res);

  // Override the json method
  res.json = function (body: any): Response {
    // If body is already in the correct format, return it as is
    if (
      body &&
      typeof body === 'object' &&
      ('success' in body || 'message' in body || 'data' in body || 'error' in body)
    ) {
      return originalJson(body);
    }

    // If body is an array or primitive, wrap it in data
    if (Array.isArray(body) || typeof body !== 'object' || body === null) {
      return originalJson({
        success: true,
        message: 'Request successful',
        data: body,
      });
    }

    // For objects, check if it looks like an error response
    if (body.statusCode || body.message || body.name === 'HttpError') {
      return originalJson({
        success: false,
        message: body.message || 'An error occurred',
        error: {
          statusCode: body.statusCode || 500,
          details: body.details || null,
        },
      });
    }

    // For regular objects, wrap in data
    return originalJson({
      success: true,
      message: 'Request successful',
      data: body,
    });
  };

  next();
};
