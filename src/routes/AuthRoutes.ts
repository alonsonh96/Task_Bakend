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


export default router;