import { Router } from 'express';
import { body } from 'express-validator';
import { ProjectController } from '../controllers/ProjectController';
import { handleInputErrors } from '../middleware/validation';
import { TaskController } from '../controllers/TaskController';
import { validateProjectExists } from '../middleware/project';
import { taskBelongsProject, validateTaskExists } from '../middleware/task';
import { validateMongoId, validateProjectBody, validateTaskBody } from '../validators/validators';
import { authenticateToken } from '../middleware/auth';
import { TeamMemberController } from '../controllers/TeamController';
import { emailAccountValidators } from '../validators/authValidators';

const router = Router();

router.use(authenticateToken)

router.param('projectId', validateProjectExists)
router.param('taskId', async (req, res, next, id) => {
    await validateTaskExists(req, res, async () => {
    await taskBelongsProject(req, res, next);
  });
});

router.get('/', ProjectController.getAllProjects);

router.post('/', 
    validateProjectBody,
    handleInputErrors,
    ProjectController.createProject
);

router.route('/:projectId')
    .get(validateMongoId('projectId'), handleInputErrors, ProjectController.getProjectById)
    .put([...validateProjectBody, validateMongoId('projectId')], handleInputErrors, ProjectController.updateProjectById)
    .delete(validateMongoId('projectId'), handleInputErrors, ProjectController.deleteProjectById);


// --- Task routes ---
router.get('/:projectId/tasks', TaskController.getProjectTask)

router.route('/:projectId/tasks/:taskId')
    .get(validateMongoId('taskId'), handleInputErrors, TaskController.getTaskById)
    .put([...validateTaskBody, validateMongoId('taskId')], handleInputErrors, TaskController.updateTask)
    .delete(validateMongoId('taskId'), handleInputErrors, TaskController.deleteTask)

router.post('/:projectId/tasks',
    validateTaskBody,
    handleInputErrors,
    TaskController.createTask
)

router.post('/:projectId/tasks/:taskId/status', 
    validateMongoId('taskId'),
    body('status').notEmpty().withMessage('El estado es obligatorio'),
    handleInputErrors,
    TaskController.updateStatus
)


// -- Route for teams -- // 
router.post('/:projectId/team/find',
    emailAccountValidators,
    handleInputErrors,
    TeamMemberController.findMemberByEmail
)

router.get('/:projectId/team',
    TeamMemberController.getMembersByProject
)

router.post('/:projectId/team',
    body('id').isMongoId().withMessage('Id not valid'),
    handleInputErrors,
    TeamMemberController.addMemberById
)

router.delete('/:projectId/team/:userId',
    validateMongoId('userId'),
    handleInputErrors,
    TeamMemberController.removeMemberById
)

export default router;