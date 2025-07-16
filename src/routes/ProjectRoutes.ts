import { Router } from 'express';
import { body, param } from 'express-validator';
import { ProjectController } from '../controllers/ProjectController';
import { handleInputErrors } from '../middleware/validation';
import { TaskController } from '../controllers/TaskController';

const router = Router();

router.post('/', 
    body('projectName').notEmpty().withMessage('Project name is required'),
    body('clientName').notEmpty().withMessage('Client name is required'),
    body('description').notEmpty().withMessage('Description is required'),
    handleInputErrors,
    ProjectController.createProject
);

router.get('/', ProjectController.getAllProjects);
router.get('/:id', 
    param('id').isMongoId().withMessage('Invalid project ID'),
    handleInputErrors,
    ProjectController.getProjectById
);


router.put('/:id', 
    param('id').isMongoId().withMessage('Invalid project ID'),
    body('projectName').notEmpty().withMessage('Project name is required'),
    body('clientName').notEmpty().withMessage('Client name is required'),
    body('description').notEmpty().withMessage('Description is required'),
    handleInputErrors,
    ProjectController.updateProjectById
);


router.delete('/:id',
    param('id').isMongoId().withMessage('Invalid project ID'),
    handleInputErrors,
    ProjectController.deleteProjectById
);


// Routers for tasks
router.post('/:projectId/tasks', 
    TaskController.createTask
)


export default router;