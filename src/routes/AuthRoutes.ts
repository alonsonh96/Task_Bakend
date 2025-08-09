import { Router } from "express";
import { body } from "express-validator";
import { AuthController } from "../controllers/AuthController";
import { handleInputErrors } from "../middleware/validation";
import { confirmAccountValidation, createAccountValidators, logginAccountValidation } from "../validators/validators";

const router = Router();

router.post('/create-account', 
    createAccountValidators,
    handleInputErrors,
    AuthController.createAccount)

router.post('/confirm-account',
    confirmAccountValidation,
    handleInputErrors,
    AuthController.confirmAccount)

router.post('/login',
    logginAccountValidation,
    handleInputErrors,
    AuthController.loginAccount
)


export default router;