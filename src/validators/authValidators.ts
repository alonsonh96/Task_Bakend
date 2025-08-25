import { body, ValidationChain  } from 'express-validator';


const validators = {
  name: {
    required: () => body('name').trim().notEmpty().withMessage('Name is required').isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters')
  },
  email: {
    valid: () => body('email').isEmail().withMessage('Email is not valid').normalizeEmail()
  },
  password: {

    current: () => body('current_password')
                      .trim()
                      .notEmpty()
                      .withMessage('Current password cannot be empty.')
                      .isLength({min: 8}).withMessage(`Password must be at least ${8} characters long`),

    required: () => body('password').notEmpty().withMessage('Password cannot be empty.')
    ,

    minLength: (min: number = 8) => body('password').isLength({ min }).withMessage(`Password must be at least ${min} characters long`),

    confirmation: () =>
      body('password_confirmation').custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error('Passwords do not match')
        }
        return true
      })
  },
  token: {
    required: () => body('token').notEmpty().withMessage('Token is required')
  }
}



export const createAccountValidators : ValidationChain[] = [
    validators.name.required(),
    validators.email.valid(),
    validators.password.required(),
    validators.password.minLength(8),
    validators.password.confirmation()
]

export const confirmAccountValidators : ValidationChain[] = [
    validators.token.required()
]

export const logginAccountValidators = [
    validators.email.valid(),
    validators.password.required(),
    validators.password.minLength(8)
]

export const emailAccountValidators = [
    validators.email.valid()
]

export const passwordConfirmationValidators = [
  validators.password.required(),
  validators.password.minLength(8),
  validators.password.confirmation()
]

export const updateProfileValidators = [
  validators.name.required(),
  validators.email.valid()
]

export const updateCurrentUserPasswordValidators = [
    validators.password.current(),
    validators.password.required(),
    validators.password.minLength(8),
    validators.password.confirmation()
]