import { body, ValidationChain  } from 'express-validator';


const validators = {
  name: {
    required: () => body('name')
                      .trim()
                      .notEmpty()
                      .withMessage('NAME_REQUIRED')
                      .isLength({ min: 2, max: 50 })
                      .withMessage('NAME_LENGTH_INVALID')
  },
  email: {
    valid: () => body('email')
                    .isEmail()
                    .withMessage('EMAIL_INVALID')
                    .normalizeEmail()
  },
  password: {

    current: () => body('current_password')
                      .trim()
                      .notEmpty()
                      .withMessage('PASSWORD_REQUIRED')
                      .isLength({min: 8}).withMessage(`PASSWORD_TOO_SHORT`),

    required: () => body('password')
                      .notEmpty()
                      .withMessage('PASSWORD_REQUIRED'),

    minLength: (min: number = 8) => body('password')
                                      .isLength({ min })
                                      .withMessage(`PASSWORD_TOO_SHORT`),

    confirmation: () =>
      body('password_confirmation').custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error('PASSWORD_MISMATCH')
        }
        return true
      })
  },
  token: {
    required: () => body('token')
                      .notEmpty()
                      .withMessage('TOKEN_REQUIRED')
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