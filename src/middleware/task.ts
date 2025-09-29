import type { Request, Response, NextFunction } from 'express';
import Task, { ITask } from '../models/Task';
import { ForbiddenError, NotFoundError, UnauthorizedError, ValidationError } from '../utils/errors';

declare global {
    namespace Express {
        interface Request {
            task: ITask; // Use the IProject because it extends Document
        }
    }
}


export async function validateTaskExists(req: Request, res: Response, next: NextFunction) {
    try {
        const { taskId } = req.params;
        if(!taskId?.trim()) throw new ValidationError('VALIDATION_REQUIRED_FIELDS')

        const task = await Task.findById(taskId);  
        if(!task) throw new NotFoundError('TASK_NOT_FOUND')

        req.task = task;
        next();
    } catch (error) {
        return next(error);
    }
}


export async function taskBelongsProject(req: Request, res: Response, next: NextFunction) {
    try {
        if (req.task.project.toString() !== req.project.id.toString()){
            throw new ForbiddenError('TASK_NOT_IN_PROJECT')
        }
        next()
    } catch (error) {
        return next(error)
    }
}


export async function hasAuthorization(req: Request, res: Response, next: NextFunction) {
    const userId = req.user._id.toString();
    const managerId = req.project.manager.toString();
    try {
        if(userId !== managerId){
            throw new UnauthorizedError('UNAUTHORIZED_ACTION')
        }
        next()
    } catch (error) {
        return next(error)
    }
}