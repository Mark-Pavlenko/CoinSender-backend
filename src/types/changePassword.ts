import * as joi from 'joi';

export const changePasswordSchema = joi.object({
  old_password: joi.string().example('N1fL@123').max(16).required(),
  password: joi.string().example('N2fL@456').max(16).required(),
});
