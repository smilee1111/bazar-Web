import multer from "multer";
import { v4 as uuid } from "uuid";
import path from "path";
import fs from "fs";
import { HttpError } from "../errors/http-error";
// Ensure the uploads directory exists
//_dirname -current source code directory
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = uuid();
        const extension = path.extname(file.originalname);
        cb(null, uniqueSuffix + extension);
    }
});

const imageFileFilter = (req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new HttpError(400, 'Invalid file type. Only JPEG, PNG and GIF are allowed.'));
    }
};

const documentFileFilter = (req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const allowedMimeTypes = ['application/pdf'];
    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new HttpError(400, 'Invalid file type. Only PDF files are allowed.'));
    }
};

export const upload = multer({
    storage: storage,
    fileFilter: imageFileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5 MB limit
});

export const documentUpload = multer({
    storage: storage,
    fileFilter: documentFileFilter,
    limits: { fileSize: 10 * 1024 * 1024 } // 10 MB limit for documents
});

export const uploads = {
    single: (fieldName: string) => upload.single(fieldName),
    array: (fieldName: string, maxCount: number) => upload.array(fieldName, maxCount),
    fields: (fieldsArray: { name: string; maxCount?: number }[]) => upload.fields(fieldsArray)
};

export const documentUploads = {
    single: (fieldName: string) => documentUpload.single(fieldName)
};