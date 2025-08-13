export class AppError extends Error {
    public readonly statusCode: number;
    public readonly errorCode: string;
    public readonly isOperational: boolean;

    constructor(message: string, statusCode: number, errorCode: string){
        super(message);
        this.statusCode = statusCode;
        this.errorCode = errorCode;
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }
}


export class ValidationError extends AppError {
    constructor(message: string = 'Invalid data provided'){
        super(message, 400, 'VALIDATION_ERROR')
    } 
}

export class DuplicateError extends AppError {
    constructor(message: string = 'Resource already exists') {
        super(message, 409, 'DUPLICATE_RESOURCE');
    }
}

export class NotFoundError extends AppError {
    constructor(message: string = 'Resource not found') {
        super(message, 404, 'NOT_FOUND');
    }
}

export class UnauthorizedError extends AppError {
    constructor(message: string = 'Unauthorized access') {
        super(message, 401, 'UNAUTHORIZED');
    }
}


