import { body, ValidationChain  } from 'express-validator';


const validators = {
  name: {
    required: () => body('name').trim().notEmpty().withMessage('Name is required')
  },
  email: {
    valid: () => body('email').isEmail().withMessage('Email is not valid')
  },
  password: {
    required: () => body('password').notEmpty().withMessage('Password cannot be empty.'),

    minLenght: (min: number = 8) => body('password').isLength({ min }).withMessage('Password must be at least 8 characters long'),

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
    validators.password.minLenght(8),
    validators.password.confirmation()
]

export const confirmAccountValidators : ValidationChain[] = [
    validators.token.required()
]

export const logginAccountValidators = [
    validators.email.valid(),
    validators.password.required(),
    validators.password.minLenght(8)
]

export const emailAccountValidators = [
    validators.email.valid()
]