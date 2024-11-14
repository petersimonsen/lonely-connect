import { NextFunction, Request, Response } from "express";
import { CustomError } from "./error";

export const errorHandlerMiddleware = (error: Error, req: Request, res: Response, next: NextFunction) => {
    if(error instanceof CustomError){
        const { statusCode, errors, logging} = error;
        if(logging){
            console.error(JSON.stringify({
                code: error.statusCode,
                errors: error.errors,
                stack: error.stack,
            }, null, 2))
        }
        console.error(JSON.stringify(error, null, 2));    
        return res.status(statusCode).send({ errors });
    }

    console.error(JSON.stringify(error, null, 2));
    res.status(500).send({ errors: [{ message: "i am error"}]});
};