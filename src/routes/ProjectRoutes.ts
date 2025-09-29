import { Router } from 'express';
import { body } from 'express-validator';
import { ProjectController } from '../controllers/ProjectController';
import { handleInputErrors } from '../middleware/validation';
import { TaskController } from '../controllers/TaskController';
import { validateProjectExists } from '../middleware/project';
import { hasAuthorization, taskBelongsProject, validateTaskExists } from '../middleware/task';
import { validateMongoId, validateNoteBody, validateProjectBody, validateTaskBody } from '../validators/validators';
import { authenticateToken } from '../middleware/auth';
import { TeamMemberController } from '../controllers/TeamController';
import { emailAccountValidators } from '../validators/authValidators';
import { NoteController } from '../controllers/NoteController';

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
    .put(hasAuthorization, [...validateProjectBody, validateMongoId('projectId')], handleInputErrors, ProjectController.updateProjectById)
    .delete(hasAuthorization, validateMongoId('projectId'), handleInputErrors, ProjectController.deleteProjectById);


// --- Task routes ---
router.get('/:projectId/tasks', TaskController.getProjectTask)

router.route('/:projectId/tasks/:taskId')
    .get(validateMongoId('taskId'), handleInputErrors, TaskController.getTaskById)
    .put(hasAuthorization, [...validateTaskBody, validateMongoId('taskId')], handleInputErrors, TaskController.updateTask)
    .delete(hasAuthorization, validateMongoId('taskId'), handleInputErrors, TaskController.deleteTask)

router.post('/:projectId/tasks',
    hasAuthorization,
    validateTaskBody,
    handleInputErrors,
    TaskController.createTask
)

router.post('/:projectId/tasks/:taskId/status', 
    validateMongoId('taskId'),
    body('status').notEmpty().withMessage('STATUS_TASK_REQUIRED'),
    handleInputErrors,
    TaskController.updateStatus
)


// -- Route for teams -- // 
router.post('/:projectId/team/find',
    hasAuthorization,
    emailAccountValidators,
    handleInputErrors,
    TeamMemberController.findMemberByEmail
)

router.get('/:projectId/team',
    TeamMemberController.getMembersByProject
)

router.post('/:projectId/team',
    hasAuthorization,
    body('id').isMongoId().withMessage('Id not valid'),
    handleInputErrors,
    TeamMemberController.addMemberById
)

router.delete('/:projectId/team/:userId',
    hasAuthorization,
    validateMongoId('userId'),
    handleInputErrors,
    TeamMemberController.removeMemberById
)


// -- Routes for notes --//
router.post('/:projectId/tasks/:taskId/notes',
    validateNoteBody,
    handleInputErrors,
    NoteController.createNote
)

router.get('/:projectId/tasks/:taskId/notes',
    NoteController.getTaskNotes
)

router.delete('/:projectId/tasks/:taskId/notes/:noteId',
    validateMongoId('noteId'),
    handleInputErrors,
    NoteController.deleteNote
)


export default router;