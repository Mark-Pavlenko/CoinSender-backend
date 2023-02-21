import * as joi from 'joi';

export const editTransferSchema = joi.object({
  amount: joi.number().example(1).required(),
  transfer_id: joi.string().required(),
  notes: joi.string().example('New notes').max(600).allow(null, ''),
});
