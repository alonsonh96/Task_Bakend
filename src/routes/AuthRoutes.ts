import { Router } from "express";
import { body } from "express-validator";
import { AuthController } from "../controllers/AuthController";
import { handleInputErrors } from "../middleware/validation";
import { confirmAccountValidation, createAccountValidators } from "../validators/validators";

const router = Router();

router.post('/create-account', 
    createAccountValidators,
    handleInputErrors,
    AuthController.createAccount)

router.post('/confirm-account',
    confirmAccountValidation,
    handleInputErrors,
    AuthController.confirmAccount)

export default router;