import { Router } from "express";
import { body, param } from "express-validator";
import { AuthController } from "../controllers/AuthController";
import { handleInputErrors } from "../middleware/validation";
import { confirmAccountValidators, 
    createAccountValidators, 
    emailAccountValidators, 
    logginAccountValidators, 
    passwordConfirmationValidators} from "../validators/authValidators";

const router = Router();

router.post('/create-account', 
    createAccountValidators,
    handleInputErrors,
    AuthController.createAccount)

router.post('/confirm-account',
    confirmAccountValidators,
    handleInputErrors,
    AuthController.confirmAccount)

router.post('/login',
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
    param('token').isNumeric().withMessage('Token not valid'),
    passwordConfirmationValidators,
    handleInputErrors,
    AuthController.updatePasswordWithToken
)

export default router;