import type { Request, Response, NextFunction } from 'express';
import Task, { ITask } from '../models/Task';
import { ForbiddenError, NotFoundError, ValidationError } from '../utils/errors';

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
        if(!taskId?.trim()) throw new ValidationError('Task ID is required')

        const task = await Task.findById(taskId);
        if(!task) throw new NotFoundError('Task not found')

        req.task = task;
        next();
    } catch (error) {
        return next(error);
    }
}


export async function taskBelongsProject(req: Request, res: Response, next: NextFunction) {
    try {
        if (req.task.project.toString() !== req.project.id.toString()){
            throw new ForbiddenError('Task does not belong to this project')
        }
        next()
    } catch (error) {
        return next(error)
    }
}