export interface ParsedDataDto {
  name: string;
  second_name: string;
  description: string;
  wallet_id: string;
  amount: number;
  notes: string;
}

export const parsedTransfersDataReqFields = [
  'name',
  'second_name',
  'wallet_id',
  'amount',
];
