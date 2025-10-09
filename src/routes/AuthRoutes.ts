import { Router } from "express";
import { body, param } from "express-validator";
import { AuthController } from "../controllers/AuthController";
import { handleInputErrors } from "../middleware/validation";
import { confirmAccountValidators, 
    createAccountValidators, 
    emailAccountValidators, 
    logginAccountValidators, 
    passwordConfirmationValidators,
    updateCurrentUserPasswordValidators,
    updateProfileValidators} from "../validators/authValidators";
import { authenticateToken } from "../middleware/auth";
import { authLimiter, passwordChangeLimiter, profileUpdateLimiter } from "../middleware/limiterMiddleware";

const router = Router();

router.post('/create-account', 
    authLimiter,
    createAccountValidators,
    handleInputErrors,
    AuthController.createAccount)

router.post('/confirm-account',
    confirmAccountValidators,
    handleInputErrors,
    AuthController.confirmAccount)

router.post('/login',
    authLimiter,
    logginAccountValidators,
    handleInputErrors,
    AuthController.loginAccount
)

router.post('/request-code', 
    emailAccountValidators,
    handleInputErrors,
    AuthController.requestConfirmationCode
)

router.post('/forgot-password',
    passwordChangeLimiter,
    emailAccountValidators,
    handleInputErrors,
    AuthController.forgotPassword
)

router.post('/validate-token',
    confirmAccountValidators,
    handleInputErrors,
    AuthController.validateToken
)

router.post('/update-password/:token',
    passwordChangeLimiter,
    param('token').isNumeric().withMessage('Token not valid'),
    passwordConfirmationValidators,
    handleInputErrors,
    AuthController.updatePasswordWithToken
)

router.post('/refresh',
    AuthController.refreshToken
)

router.get('/user',
    authenticateToken,
    AuthController.getUser
)

router.post('/logout',
    authenticateToken,
    AuthController.logoutUser
)


// -- Profile -- //
router.put('/profile',
    authenticateToken,
    profileUpdateLimiter,
    updateProfileValidators,
    handleInputErrors,
    AuthController.updateProfile
)

router.post('/update-password',
    authenticateToken,
    updateCurrentUserPasswordValidators,
    handleInputErrors,
    AuthController.updateCurrentUserPassword
)

export default router;