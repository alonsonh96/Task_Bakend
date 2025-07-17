import { Router } from 'express';
import { body, param } from 'express-validator';
import { ProjectController } from '../controllers/ProjectController';
import { handleInputErrors } from '../middleware/validation';
import { TaskController } from '../controllers/TaskController';
import { validateProjectExists } from '../middleware/project';

const router = Router();

router.get('/', ProjectController.getAllProjects);

router.get('/:id', 
    param('id').isMongoId().withMessage('Invalid project ID'),
    handleInputErrors,
    ProjectController.getProjectById
);

router.post('/', 
    body('projectName').notEmpty().withMessage('Project name is required'),
    body('clientName').notEmpty().withMessage('Client name is required'),
    body('description').notEmpty().withMessage('Description is required'),
    handleInputErrors,
    ProjectController.createProject
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
router.param('projectId', validateProjectExists)

router.get('/:projectId/tasks',
    TaskController.getProjectTask
)

router.get('/:projectId/tasks/:taskId',
    param('taskId').isMongoId().withMessage('Invalid ID'),
    handleInputErrors,
    TaskController.getTaskById
)

router.post('/:projectId/tasks',
    body('name').notEmpty().withMessage('Task name is required'),
    body('description').notEmpty().withMessage('Task description is required'),
    TaskController.createTask
)


router.put('/:projectId/tasks/:taskId',
    param('taskId').isMongoId().withMessage('Invalid ID'),
    body('name').notEmpty().withMessage('Task name is required'),
    body('description').notEmpty().withMessage('Task description is required'),
    handleInputErrors,
    TaskController.updateTask
)


export default router;