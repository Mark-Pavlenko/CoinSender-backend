import * as joi from 'joi';
import { QtyType } from '../model/invoicesItems.entity';

export const createInvoice = joi.object({
  email: joi.string().required(),
  email_client: joi.string().required(),
  invoice_number: joi.number().required(),
  created_date: joi.string().required(),
  due_date: joi.string().required(),
  wallet: joi.string().required(),
  company_name_client: joi.string().required(),
  wallet_client: joi.string().required(),
  amount_with_tax: joi.number().required(),
  amount_total_tax: joi.number().required(),
  amount_total: joi.number().required(),
  amount_currency: joi.string().required(),
  invoice_items: joi.array().items(
    joi.object({
      description: joi.string().required(),
      qty: joi.number().required(),
      qty_type: joi
        .string()
        .valid(...Object.values(QtyType))
        .required(),
      unit_price: joi.number().required(),
      discount: joi.number(),
      tax: joi.number(),
      amount: joi.number().required(),
    }),
  ),
});
