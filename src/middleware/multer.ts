import multer from 'multer'
import path from 'path'
import {v4 as uuidv4} from 'uuid'
import fs from 'fs'





export const uploader = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, path.resolve(__dirname, 'public/temp'));
    },
    filename: (req, file, cb) => {
      const newFileName = uuidv4() + path.extname(file.originalname)

      cb(null,newFileName)
    },
  }),
  limits: { fileSize: 1048576 }, // 1MB
});













