import * as joi from 'joi';

export const editEmployeeProfileSchema = joi.object({
  id: joi.number().example(1).required(),
  name: joi.string().example('Mark').max(30).required(),
  second_name: joi.string().example('Davids').max(30).required(),
  wallet_id: joi.string().example('WalletID').max(300).required(),
});
