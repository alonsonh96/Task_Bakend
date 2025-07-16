import type { Request, Response } from 'express';
import Project from '../models/Project';
import Task from '../models/Task';

export class TaskController {
    static createTask = async (req: Request, res: Response) => {

        const { projectId } = req.params;
        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }
        
        try {
            const task = new Task({
                ...req.body,
                project: projectId // Associate the task with the project
            })
            await task.save();
            res.send({ message: 'Task created successfully', task});
        } catch (error) {
            res.status(500).json({ message: 'Error creating task', error });
        }
    }
}