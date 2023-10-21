import HTTP_STATUS, { INTERNAL_SERVER_ERROR, StatusCodes } from 'http-status-codes';

//Will create interface that will have Error values/data we want to show

export interface IErrorRespponse {
    message: string;
    statusCode: number; 
    status: string; 
    serializeErrors() : IError
}

export interface IError {
    message: string;
    statusCode: number;
    status: string
}

//create an custom abstract class

export abstract class customError extends Error {
    abstract statusCode: number;
    abstract status: string;

    constructor(message: string) {
        super(message);
    }

    serializeErrors() : IError {
        return {
            message: this.message,
            status: this.status,
            statusCode: this.statusCode
        }        
    }
}

//We will create custom Error class:-

export class JoiRequestValidationError extends customError {
    statusCode = HTTP_STATUS.BAD_REQUEST;
    status= 'error';
    constructor(message: string) {
        super(message);
    }
}

export class BadRequestError extends customError {
    statusCode = HTTP_STATUS.BAD_REQUEST;
    status= 'error'
    constructor(message: string){
        super(message);
    }
}
// How we gonna use this class:-
// throw new BadRequestError('You have an error);

export class NotFoundError extends customError {        //404
    statusCode = HTTP_STATUS.BAD_REQUEST;
    status = 'error';
    constructor(message: string){
        super(message);
    }
}

export class NotAuthorizedError extends customError {
    statusCode = HTTP_STATUS.UNAUTHORIZED;
    status = 'error';
    constructor(message: string){
        super(message);
    }
}

export class FileTooLarge extends customError {
    statusCode = HTTP_STATUS.REQUEST_TOO_LONG;
    status = 'error'
    constructor(message: string){
        super(message);
    }
}

export class ServerError extends customError {
    statusCode = HTTP_STATUS.SERVICE_UNAVAILABLE;
    status = 'error';
    constructor(message: string){
        super(message);
    }
}