export type CustomErrorContent = {
    message: string,
    context?: { [key: string]: any }
};

export abstract class CustomError extends Error {
    abstract readonly statusCode: number;
    abstract readonly errors: CustomErrorContent[];
    abstract readonly logging: boolean;

    constructor(message: string) {
        super(message);

        Object.setPrototypeOf(this, CustomError.prototype);
    }
};

export class BadRequestError extends CustomError {
    private static readonly _statusCode = 400;
    private readonly _code: number;
    private readonly _logging: boolean;
    private readonly _context: { [key: string]: any };

    constructor(params?: { code?: number; message?: string; logging?: boolean; context?: { [key: string]: any}}){
        const { code, message, logging} = params || {};
        super(message || "Bad Request");
        this._code = code || BadRequestError._statusCode;
        this._logging = logging || false;
        this._context = params?.context || {};
        Object.setPrototypeOf(this, BadRequestError.prototype);    
    }

    get errors() {
        return [{ message: this.message, context: this._context }];
    }
    
    get statusCode() {
        return this._code;
      }
    
      get logging() {
        return this._logging;
      }
    
}