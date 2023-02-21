import {
  ParsedDataDto,
  parsedTransfersDataReqFields,
} from './interfaces/transferUploadParsedDataDto';
import { ethers } from 'ethers';

export const removeExistingObjectsByWalletId = (arr1, arr2) => {
  return [].concat(
    arr1.filter((obj1) =>
      arr2.every((obj2) => obj1.wallet_id !== obj2.wallet_id),
    ),
    arr2.filter((obj2) =>
      arr1.every((obj1) => obj2.wallet_id !== obj1.wallet_id),
    ),
  );
};

export const checkTransferDataOnValidityType = (parsedData: ParsedDataDto) => {
  return parsedTransfersDataReqFields.every((i) =>
    parsedData.hasOwnProperty(i),
  );
};

export const transfersWithSimilarWallets = (transfersList) => {
  const valueArr = transfersList.map((item) => {
    return item.wallet_id;
  });
  return valueArr.some((item, idx) => {
    return valueArr.indexOf(item) != idx;
  });
};

export const checkEthWalletForValidity = (wallet_id: string) => {
  return ethers.utils.isAddress(wallet_id);
};

export const existingItemsWithSpecificWallets = (obj, list) => {
  for (let i = 0; i < list.length; i++) {
    if (list[i].wallet_id === obj.wallet_id) {
      return true;
    }
  }

  return obj;
};
