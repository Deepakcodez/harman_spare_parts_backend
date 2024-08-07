import multer from 'multer'
import path from 'path'
import {v4 as uuidv4} from 'uuid'
import fs from 'fs'

// Ensure the directory exists
const tempDir = path.join(__dirname, 'public', 'temp');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, tempDir)
    },
    filename: function (req, file, cb) {
      const newFileName = uuidv4() + path.extname(file.originalname)

      cb(null,newFileName)
    }
  })
  
  export const upload = multer({ storage: storage })