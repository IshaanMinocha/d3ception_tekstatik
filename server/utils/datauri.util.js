import DataURIParser from 'datauri/parser.js'
import path from 'path'

export const getDataUri = (file) => {
    const parser = new DataURIParser();
    // const extName = path.extname(file.originalName).toString();
    const extName = path.extname(file.originalname || '');
    return parser.format(extName, file.buffer);
}