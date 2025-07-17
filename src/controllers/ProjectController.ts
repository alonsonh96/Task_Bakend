import type { Request, Response } from 'express';
import Project from '../models/Project';

export class ProjectController {

    static getAllProjects = async(req: Request, res:Response) => {
        try {
            const projects = await Project.find().populate('tasks'); // Populate tasks field
            res.status(200).json(projects);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching projects', error });
        }
    } 

    
    static getProjectById = async(req: Request, res: Response) => {
        try {
            const id = req.params.id;
            const projectById = await Project.findById(id).populate('tasks');
            if(!projectById) {
                return res.status(404).json({ error: 'Project not found' });
            }
            res.status(200).json(projectById);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching project by ID', error });
        }
    }

    static createProject = async(req: Request, res: Response) => {
        const project = new Project(req.body);
        try {
            await project.save();
            res.status(201).send({ message: 'Project created successfully' });
        } catch (error) {
            res.status(500).json({ message: 'Error creating project', error });
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
            res.status(200).send({ message: 'Project updated successfully' });
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
            res.status(200).send({ message: 'Project deleted successfully' });
        } catch (error) {
            res.send({ message: 'Error deleting project', error });
        }
    }


}