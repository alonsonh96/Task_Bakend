import { Router } from "express";
import { body } from "express-validator";
import { AuthController } from "../controllers/AuthController";
import { handleInputErrors } from "../middleware/validation";
import { confirmAccountValidators, 
    createAccountValidators, 
    emailAccountValidators, 
    logginAccountValidators } from "../validators/authValidators";

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
    
)

export default router;