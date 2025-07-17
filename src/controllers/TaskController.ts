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

            const savedTask = await task.save();

            return res.status(201).json({
                message: 'Task created successfully',
                data: savedTask
            });
        } catch (error) {
            return res.status(500).json({ message: 'Error creating task', error });
        }
    }


    static getProjectTask = async (req: Request, res: Response) => {
        try {
            const { projectId } = req.params;
            const tasks = await Task.find({project: projectId}).populate('project')
            return res.status(200).json({
                message: 'Tasks fetched successfully',
                data: tasks
            });
        } catch (error) {
            return res.status(500).json({ message: 'Error get task', error });
        }
    }


    static getTaskById = async (req: Request, res: Response) => {
        try {
            const { taskId } = req.params;
            const task = await Task.findById(taskId)
            if (!task) {
                return res.status(404).json({ message: 'Task not found' });
            }
            if (task.project.toString() !== req.project.id) {
                return res.status(403).json({ message: 'Forbidden action: Task does not belong to this project' });
            }

            return res.status(200).json(task);
        } catch (error) {
            return res.status(500).json({ message: 'Error get task', error})
        }
    }


    static updateTask = async (req: Request, res: Response) => {
        try {
            const { taskId } = req.params
            const task = await Task.findById(taskId)
            if(!task){
                return res.status(404).json({ message: 'Task not found' });
            }
            if (task.project.toString() !== req.project.id) {
                return res.status(403).json({ message: 'Forbidden action: Task does not belong to this project' });
            }

            const updatedTask = await Task.findByIdAndUpdate(taskId, req.body, {
                new: true,  // Return the updated document
                runValidators: true// Apply schema validations
            });

            return res.status(200).json({
                message: 'Task updated successfully',
                task: updatedTask
            });
        } catch (error) {
            return res.status(500).json({ message: 'Error update task', error})
        }
    }
}