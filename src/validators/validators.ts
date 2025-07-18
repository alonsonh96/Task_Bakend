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