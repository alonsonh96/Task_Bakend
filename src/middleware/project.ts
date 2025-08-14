import type { Request, Response, NextFunction } from 'express';
import Project, { IProject } from '../models/Project';
import { NotFoundError, ValidationError } from '../utils/errors';

declare global {
    namespace Express {
        interface Request {
            project: IProject; // Use the IProject because it extends Document
        }
    }
}


export async function validateProjectExists(req: Request, res: Response, next: NextFunction) {
    try {
        const { projectId } = req.params;
        if(!projectId || !projectId.trim()) throw new ValidationError('Project ID is required')

        const project = await Project.findById(projectId).populate('tasks');
        if(!project) throw new NotFoundError('Project not found')

        req.project = project; // Attach the project to the request object for further use
        // Optionally, you can also attach the project ID to the request object
        next(); // Proceed to the next middleware or route handler
    } catch (error) {
        return next(error);
    }
}