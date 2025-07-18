import type { Request, Response } from 'express';
import Project from '../models/Project';
import Task from '../models/Task';

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
            return res.status(200).json(req.project);
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
            const { idProject } = req.params;
            const updatedProject = await Project.findByIdAndUpdate(idProject, req.body, {
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