import type { Request, Response } from 'express';
import Task from '../models/Task';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess } from '../utils/responses';
import { ValidationError } from '../utils/errors';

export class TaskController {
    static createTask = asyncHandler(async (req: Request, res: Response) => {
        const { name, description } = req.body

        if(!name?.trim() || !description?.trim()) {
            throw new ValidationError('TASK_VALIDATION_REQUIRED_FIELDS')
        }

        // Create the task (validation already done by middleware)
        const task = new Task({
            name: name.trim(),
            description: description.trim(),
            project: req.project._id // Associate the task with the project
        })

        const savedTask = await task.save();

        return sendSuccess(res, 'TASK_CREATE_SUCCESS', savedTask, 201)
    })


    static getProjectTask = asyncHandler(async (req: Request, res: Response) => {
        const { projectId } = req.params;
        const tasks = await Task.find({ project: projectId })

        return sendSuccess(res, 'TASK_FETCH_SUCCESS', tasks)
    })


    static getTaskById = asyncHandler(async (req: Request, res: Response) => {
            const task = await Task.findById(req.task._id)
                                        .populate({ path: 'completedBy.user', select: '_id email name' }).lean()
                                        .populate({ path: 'notes', populate: { path: 'createdBy', select: '_id email name' }}).lean()

            return sendSuccess(res, 'TASK_FETCH_SUCCESS', task)
    })


    static updateTask = asyncHandler(async (req: Request, res: Response) => {
        const updatedTask = await Task.findByIdAndUpdate(req.task._id, req.body, {
            new: true,  // Return the updated document
            runValidators: true// Apply schema validations
        });

        return sendSuccess(res, 'TASK_UPDATE_SUCCESS', updatedTask )
    })


    static deleteTask = asyncHandler(async (req: Request, res: Response) => {
        await Task.deleteOne({ _id: req.task._id });
        return sendSuccess(res, 'TASK_DELETE_SUCCESS')
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

        return sendSuccess(res, 'TASK_STATUS_UPDATE_SUCCESS')
    })

}