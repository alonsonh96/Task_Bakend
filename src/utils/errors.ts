export class AppError extends Error {
    public readonly statusCode: number;
    public readonly messageCode: string;
    public readonly isOperational: boolean;

    constructor(statusCode: number, messageCode: string, message?: string){
        super(message || messageCode);
        this.statusCode = statusCode;
        this.messageCode = messageCode;
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }
}


export class ValidationError extends AppError {
    public readonly details?: any[];

    constructor(messageCode: string = 'VALIDATION_ERROR', details?: any[]){
        super(400, messageCode);
        this.details = details
    }
}

export class UnauthorizedError extends AppError {
    constructor(messageCode: string = 'UNAUTHORIZED') {
        super(401, messageCode);
    }
}

export class ForbiddenError extends AppError {
    constructor(messageCode: string = 'FORBIDDEN') {
        super(403, messageCode);
    }
}

export class NotFoundError extends AppError {
    constructor(messageCode: string = 'NOT_FOUND') {
        super(404, messageCode);
    }
}

export class DuplicateError extends AppError {
    constructor(messageCode: string = 'DUPLICATE_RESOURCE') {
        super(409, messageCode);
    }
}

export class UnprocessableEntityError extends AppError {
    constructor(messageCode: string = 'UNPROCESSABLE_ENTITY') {
        super(422, messageCode);
    }
}


