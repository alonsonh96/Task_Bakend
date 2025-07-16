import type { Request, Response } from 'express';
import Project from '../models/Project';

export class ProjectController {
    static createProject = async(req: Request, res: Response) => {
            const project = new Project(req.body);
            try {
                await project.save();
                res.send({ message: 'Project created successfully' });
            } catch (error) {
                res.status(500).json({ message: 'Error creating project', error });
            }
    }


    static getAllProjects = async(req: Request, res:Response) => {
        try {
            const projects = await Project.find({});
            res.json(projects);
            res.status(200).json({ message: 'Fetched all projects' });
        } catch (error) {
            res.status(500).json({ message: 'Error fetching projects', error });
        }
    } 

    
    static getProjectById = async(req: Request, res: Response) => {
        try {
            const id = req.params.id;
            console.log('Fetching project with ID:', id);
            const projectById = await Project.findById(id).populate('tasks');
            if(!projectById) {
                const error = new Error('Project not found');
                return res.status(404).json({ error: error.message });
            }
            res.json(projectById);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching project by ID', error });
        }
    }


    static updateProjectById = async(req: Request, res: Response) => {
        try {
            const id = req.params.id;
            const project = await Project.findByIdAndUpdate(id,req.body);
            if(!project) {
                const error = new Error('Project not found');
                return res.status(404).json({ error: error.message });
            }
            await project.save();
            res.send({ message: 'Project updated successfully' });
        } catch (error) {
            res.status(500).json({ message: 'Error updating project', error });
        }
    }


    static deleteProjectById = async(req:Request, res:Response) => {
        try {
            const { id } = req.params;
            const project = await Project.findById(id);
            if (!project) {
                return res.status(404).json({ message: 'Project not found' });
            }
            await Project.deleteOne();
            res.send({ message: 'Project deleted successfully' });
        } catch (error) {
            res.send({ message: 'Error deleting project', error });
        }
    }


}