export type CustomErrorContent = {
    message: string,
    context?: { [key: string]: any }
};

export abstract class CustomError extends Error {
    abstract statusCode: number;

    constructor(message: string) {
        super(message);
        this.name = this.constructor.name;
        Object.setPrototypeOf(this, CustomError.prototype);
    }

    abstract serializeError(): CustomErrorContent;

    logErrorMessage() {
        console.error(this.message);
    }
};

export class BadRequestError extends CustomError {
    statusCode = 400;
    context?: { [key: string]: any};
    
    constructor(params?: { code?: number; message?: string; context?: { [key: string]: any}}){
        const { message, context } = params || {};
        super(message || "Bad Request");
        this.context = context;
        Object.setPrototypeOf(this, BadRequestError.prototype);    
    }

    serializeError(): CustomErrorContent {
        return {
            message: this.message,
            context: this.context || {},
        };
    }
}