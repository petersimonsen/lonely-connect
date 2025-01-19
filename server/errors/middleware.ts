import { NextFunction, Request, Response } from "express";
import { logger } from './logger';
import { CustomError } from "./error";
import requestLogFormatter from './requestLogFormatter';

export const errorHandlerMiddleware = (error: Error, req: Request, res: Response, next: NextFunction) => {
    if(error instanceof CustomError){
        logger.error(
            error.message,
            requestLogFormatter(req, res, error.serializeError())
          );
        return res.status(error.statusCode).send(error.serializeError());
    }
    res.status(500).send({ errors: [{ message: "unhandled error"}]});
};

export const loggerMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const requestStartTime = Date.now();
  const originalSend = res.send;
  let responseSent = false;
  res.send = function (body: any): Response {
    if (!responseSent) {
      if (res.statusCode < 400) {
        logger.info(
          'ok',
          requestLogFormatter(req, res, null, requestStartTime)
        );
      } else {
        logger.error(
          body.message,
          requestLogFormatter(req, res, body, requestStartTime)
        );
      }
      responseSent = true;
    };
    
    // Call the original response method
    return originalSend.call(this, body);
  };
  next();
}