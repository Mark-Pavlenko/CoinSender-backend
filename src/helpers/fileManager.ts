import { unlink } from 'fs/promises';
import { extname } from 'path';
import * as XLSX from 'xlsx';
import { ParsedDataDto } from './interfaces/transferUploadParsedDataDto';

export const imageFileFilter = (req, file, callback) => {
  if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
    return callback(new Error('Only image files are allowed!'), false);
  }
  callback(null, true);
};

export const editFileName = (req, file, callback) => {
  const fileExtName = extname(file.originalname);
  const randomName = Array(20)
    .fill(null)
    .map(() => Math.round(Math.random() * 16).toString(16))
    .join('');
  callback(null, `${randomName}${fileExtName}`);
};

export const deleteFileName = async (file) => {
  await (async () => {
    try {
      await unlink('./public/avatars/' + file);
    } catch (e) {}
  })();
};

export const getFileExtension = (originalName: string) => {
  return originalName.split('.').pop();
};
export const transfersUploadingParser = async (
  file,
): Promise<ParsedDataDto[]> => {
  const wb: XLSX.WorkBook = await XLSX.readFile(`./uploads/${file.filename}`, {
    type: 'array',
    raw: true,
    cellFormula: false,
  });

  return XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
};
