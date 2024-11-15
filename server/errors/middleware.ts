import { NextFunction, Request, Response } from "express";
import { CustomError } from "./error";

export const errorHandlerMiddleware = (error: Error, req: Request, res: Response, next: NextFunction) => {
    if(error instanceof CustomError){
        error.logErrorMessage();
        return res.status(error.statusCode).send(error.serializeError());
    }

    console.error(JSON.stringify(error, null, 2));
    res.status(500).send({ errors: [{ message: "i am error"}]});
};