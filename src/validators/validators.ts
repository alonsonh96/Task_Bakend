import { body, param, ValidationChain  } from 'express-validator';

const validators = {
  mongoId: (field : string) => param(field).isMongoId().withMessage(`Invalid ${field}`),

  required: (field : string, customMessage?: string) => body(field).notEmpty().withMessage(customMessage || `${field} is required`)
}


export const validateMongoId = (name : string) => validators.mongoId(name)

export const validateProjectBody : ValidationChain[] = [
  validators.required('projectName'),
  validators.required('clientName'),
  validators.required('description'),
]

export const validateTaskBody : ValidationChain[] = [
  validators.required('name'),
  validators.required('description'),
]

export const validateNoteBody : ValidationChain[] = [
  validators.required('content')
]