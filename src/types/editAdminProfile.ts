import * as joi from 'joi';

export const editAdminProfileSchema = joi.object({
  name: joi.string().example('Mark').max(30).required(),
  second_name: joi.string().example('Davids').max(30).required(),
});
