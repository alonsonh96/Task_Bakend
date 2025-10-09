import type { Request, Response } from 'express';
import Project from '../models/Project';
import Task from '../models/Task';
import { ProjectsDTO } from '../dtos/project.dto';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess } from '../utils/responses';
import { AppError, UnauthorizedError, ValidationError } from '../utils/errors';
import mongoose from 'mongoose';

export class ProjectController {

    static getAllProjects = asyncHandler(async (req: Request, res: Response) => {
        // Retrieve all projects and populate their associated tasks
        const projects = await Project.find({ $or: [
                                                { manager: { $in: req.user._id }},
                                                { team: {$in: req.user._id}}
                                            ] }).populate('tasks');
        const projectDTOs: ProjectsDTO[] = projects.map(project => ({
            _id: String(project._id),
            projectName: project.projectName,
            clientName: project.clientName,
            description: project.description,
            manager: String(project.manager),
            tasks: project.tasks.map((task: any) => ({
                _id: String(task._id),
                name: task.name,
                description: task.description,
                status: task.status
            }))
        }));

        return sendSuccess(res,'PROJECTS_FETCH_SUCCESS', projectDTOs)
    })

    
    static getProjectById = asyncHandler(async (req: Request, res: Response) => {
        const isManager = req.project.manager.toString() === req.user._id.toString()
        const isTeamMember = req.project.team.map(memberId => memberId.toString()).includes(req.user._id.toString());
        
        if (!isManager && !isTeamMember) {
            throw new UnauthorizedError('UNAUTHORIZED_ACTION')
        }
        return sendSuccess(res, 'PROJECTS_FETCH_SUCCESS', req.project)
    })


    static createProject = asyncHandler(async(req: Request, res: Response) => {
        // Validate user authentication
        if (!req.user || !req.user._id) throw new UnauthorizedError('PROJECT_UNAUTHORIZED')
 
        const { projectName, clientName, description } = req.body
        const { _id } = req.user;

        if(!projectName?.trim() || !clientName?.trim() || !description?.trim()) {
            throw new ValidationError('PROJECT_VALIDATION_REQUIRED_FIELDS')
        }
        
        const project = new Project({ projectName, clientName, description, manager: _id });
        const saveProject = await project.save();

        return sendSuccess(res, 'PROJECT_CREATE_SUCCESS', saveProject, 201)
    })

    
    static updateProjectById = asyncHandler(async (req: Request, res: Response) => {
        if (req.project.manager.toString() !== req.user._id.toString()) {
            throw new UnauthorizedError('UNAUTHORIZED_ACTION')
        }

        const { projectId } = req.params;
        const updatedProject = await Project.findByIdAndUpdate(projectId, req.body, {
            new: true,
            runValidators: true,
        });

        return sendSuccess(res, 'PROJECT_UPDATE_SUCCESS', updatedProject)
    })


    static deleteProjectById = asyncHandler(async (req: Request, res: Response) => {
        if (req.project.manager.toString() !== req.user._id.toString()) {
            throw new UnauthorizedError('UNAUTHORIZED_ACTION')
        }

        const { projectId } = req.params

        // Use transaction to ensure both operations succeed or fail together
        const session = await mongoose.startSession()
        try {
            await session.withTransaction(async () => {
                // The Task middleware will take care of deleting the notes
                await Task.deleteMany({ project: projectId }, { session });

                // Delete the project
                await Project.deleteOne({ _id: req.params.projectId }, { session });
            })
        } catch (error) {
            console.error('Error deleted project:', error);
            throw new AppError(500, 'PROJECT_DELETE_FAILED');
        } finally {
            await session.endSession()
        }
        
        return sendSuccess(res, 'PROJECT_DELETE_SUCCESS')
    })

}