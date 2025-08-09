import { body, param } from 'express-validator';

// Common validators
export const validateMongoId = (name: string) => param(name).isMongoId().withMessage(`Invalid ${name}`);

export const validateProjectBody = [
  body('projectName').notEmpty().withMessage('Project name is required'),
  body('clientName').notEmpty().withMessage('Client name is required'),
  body('description').notEmpty().withMessage('Description is required'),
];

export const validateTaskBody = [
  body('name').notEmpty().withMessage('Task name is required'),
  body('description').notEmpty().withMessage('Task description is required'),
];



// Auth validators
export const createAccountValidators = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Email is not valid'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
  body('password-confirmation').custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error('Passwords do not match');
    }
    return true;
  })
]

export const confirmAccountValidation = [
    body('token')
        .notEmpty()
        .withMessage('Token is required')
];


export const logginAccountValidation = [
  body('email').isEmail().withMessage('Email not valid'),
  body('password').notEmpty().withMessage('Password cannot be empty.'),
]