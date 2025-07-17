import type { Request, Response } from 'express';
import Project from '../models/Project';
import Task from '../models/Task';

export class TaskController {
    static createTask = async (req: Request, res: Response) => {
        try {
            const task = new Task({
                ...req.body,
                project: req.project._id // Associate the task with the project
            })
            await task.save();
            res.status(201).send({ message: 'Task created successfully', task});
        } catch (error) {
            res.status(500).json({ message: 'Error creating task', error });
        }
    }


    static getProjectTask = async (req: Request, res: Response) => {
        try {
            const projectId = req.params.projectId;
            const tasks = await Task.find({project: projectId}).populate('project')
            res.send({message: tasks})
        } catch (error) {
            res.status(500).json({ message: 'Error get task', error });
        }
    }


    static getTaskById = async (req: Request, res: Response) => {
        try {
            const taskId = req.params.taskId;
            const task = await Task.findById(taskId)
            if(!task){
                const error = new Error('Task not found');
                return res.status(404).json({ error: error.message });
            }
            if(task.project.toString() !== req.project.id){
                const error = new Error('Action invalid');
                return res.status(404).json({ error: error.message });
            }

            res.status(200).json(task);
        } catch (error) {
            res.status(500).json({ message: 'Error get task', error})
        }
    }

    
}