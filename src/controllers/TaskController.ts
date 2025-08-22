import type { Request, Response } from 'express';
import Task from '../models/Task';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess } from '../utils/responses';
import mongoose from 'mongoose';

export class TaskController {
    static createTask = asyncHandler(async (req: Request, res: Response) => {
        const { name, description } = req.body

        // Create the task (validation already done by middleware)
        const task = new Task({
            name: name.trim(),
            description: description.trim(),
            project: req.project._id // Associate the task with the project
        })

        const savedTask = await task.save();

        return sendSuccess(res, 'Task created successfully', savedTask, 201)
    })


    static getProjectTask = asyncHandler(async (req: Request, res: Response) => {
        const { projectId } = req.params;
        const tasks = await Task.find({ project: projectId })

        return sendSuccess(res, 'Tasks fetched successfully', tasks)
    })


    static getTaskById = asyncHandler(async (req: Request, res: Response) => {
            const task = await Task.findById(req.task._id).populate({ path: 'completedBy.user', select: '_id email name' }).lean()

            return sendSuccess(res, 'Task fetched successfully', task)
    })


    static updateTask = asyncHandler(async (req: Request, res: Response) => {
        const updatedTask = await Task.findByIdAndUpdate(req.task._id, req.body, {
            new: true,  // Return the updated document
            runValidators: true// Apply schema validations
        });

        return sendSuccess(res, 'Task updated successfully', updatedTask )
    })


    static deleteTask = asyncHandler(async (req: Request, res: Response) => {
        await Task.deleteOne({ _id: req.task._id });
        return sendSuccess(res, 'Task deleted successfully')
    })


    static updateStatus = asyncHandler(async (req: Request, res: Response) => {
        const { status } = req.body;
        req.task.status = status;

        const data = {
            user: req.user._id,
            status: status
        }
        req.task.completedBy.push(data)
        await req.task.save();

        return sendSuccess(res, 'Task update successfully')
    })

}