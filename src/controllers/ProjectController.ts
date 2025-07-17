import type { Request, Response } from 'express';
import Project from '../models/Project';

export class ProjectController {

    static getAllProjects = async(req: Request, res:Response) => {
        try {
            // Retrieve all projects and populate their associated tasks
            const projects = await Project.find().populate('tasks');
            return res.status(200).json({
                message: 'Projects fetched successfully',
                data: projects
            })
        } catch (error) {
            return res.status(500).json({ message: 'Error fetching projects', error });
        }
    } 

    
    static getProjectById = async(req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const projectById = await Project.findById(id).populate('tasks');
            if(!projectById) {
                return res.status(404).json({ error: 'Project not found' });
            }
            return res.status(200).json(projectById);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching project by ID', error });
        }
    }

    static createProject = async(req: Request, res: Response) => {
        const project = new Project(req.body);
        try {
            const saveProject = await project.save();

            return res.status(201).json({
                message: 'Project created successfully',
                data: saveProject
            });
        } catch (error) {
            res.status(500).json({ message: 'Error creating project', error });
        }
    }

    static updateProjectById = async(req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const updatedProject = await Project.findByIdAndUpdate(id, req.body, {
                new: true,
                runValidators: true,
            });

            if (!updatedProject) {
                return res.status(404).json({ message: 'Project not found' });
            }

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
            const { id } = req.params;
            const project = await Project.findById(id);
            if (!project) {
                return res.status(404).json({ message: 'Project not found' });
            }
            await Project.deleteOne({ _id: id });
            return res.status(200).json({ message: 'Project deleted successfully' });
        } catch (error) {
            return res.send({ message: 'Error deleting project', error });
        }
    }

}