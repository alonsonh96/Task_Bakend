import type { Request, Response } from 'express';
import Project from '../models/Project';
import Task from '../models/Task';
import { ProjectsDTO } from '../dtos/project.dto';

export class ProjectController {

    static getAllProjects = async(req: Request, res:Response) => {
        try {
            // Retrieve all projects and populate their associated tasks
            const projects = await Project.find({$or: [{manager: {$in: req.user._id}}]}).populate('tasks');
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
            return res.status(200).json({
                message: 'Projects fetched successfully',
                data: projectDTOs
            })
        } catch (error) {
            return res.status(500).json({ message: 'Error fetching projects', error });
        }
    } 

    
    static getProjectById = async (req: Request, res: Response) => {
        try {
            if (req.project.manager.toString() !== req.user._id.toString()) {
                return res.status(401).json({ message: 'Action not valid' })
            }
            return res.status(200).json(req.project);
        } catch (error) {
            return res.status(500).json({ message: 'Error fetching project by ID', error });
        }
    }

    static createProject = async(req: Request, res: Response) => {

        const { projectName, clientName, description } = req.body
        const { _id } = req.user
        
        try {
            const project = new Project({projectName, clientName, description, manager: _id});

            const saveProject = await project.save();

            return res.status(201).json({
                message: 'Project created successfully',
                data: saveProject
            });
        } catch (error) {
            return res.status(500).json({ message: 'Error creating project', error });
        }
    }

    static updateProjectById = async(req: Request, res: Response) => {
        try {
            if (req.project.manager.toString() !== req.user._id.toString()) {
                return res.status(401).json({ message: 'Action not valid' })
            }

            const { projectId } = req.params;
            const updatedProject = await Project.findByIdAndUpdate(projectId, req.body, {
                new: true,
                runValidators: true,
            });

             return res.status(200).json({
                message: 'Project updated successfully',
                data: updatedProject,
            });
        } catch (error) {
            return res.status(500).json({ message: 'Error updating project', error });
        }
    }


    static deleteProjectById = async(req:Request, res:Response) => {
        try {
            if (req.project.manager.toString() !== req.user._id.toString()) {
                return res.status(401).json({ message: 'Action not valid' })
            }

            const { projectId } = req.params
            // Elimina las tareas asociadas
            await Task.deleteMany({ project: projectId });
            await Project.deleteOne({ _id: req.params.projectId });
            return res.status(200).json({ message: 'Project deleted successfully' });
        } catch (error) {
            return res.send({ message: 'Error deleting project', error });
        }
    }

}