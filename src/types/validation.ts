import * as joi from 'joi';

export const userSchema = joi.object({
  name: joi.string().example('Mark').max(30).required(),
  second_name: joi.string().example('Davids').max(30).required(),
  company_name: joi.string().example('MegaDev').max(300).required(),
  email: joi.string().email().required(),
  password: joi.string().example('N3fL@332').max(16).required(),
});
