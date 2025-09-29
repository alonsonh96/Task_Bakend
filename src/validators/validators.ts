import { body, param, ValidationChain  } from 'express-validator';

const validators = {
  mongoId: (field : string) => param(field)
                                  .isMongoId()
                                  .withMessage(`Invalid ${field}`),

  required: (field : string, customMessage?: string) => body(field)
                                                          .notEmpty()
                                                          .withMessage(`${customMessage.toUpperCase()}_REQUIRED`)
}


export const validateMongoId = (name : string) => validators.mongoId(name)

export const validateProjectBody : ValidationChain[] = [
  validators.required('projectName', 'PROJECT_NAME'),
  validators.required('clientName', 'CLIENT_NAME'),
  validators.required('description', 'PROJECT_DESCRIPTION'),
]

export const validateTaskBody : ValidationChain[] = [
  validators.required('name', 'TASK_NAME'),
  validators.required('description', 'TASK_DESCRIPTION'),
]

export const validateNoteBody : ValidationChain[] = [
  validators.required('content', 'NOTE_CONTENT')
]