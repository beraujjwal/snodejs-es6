import multer from 'multer';
import path from 'path';

// Setup storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'temp/'); // Uploads go to /uploads
  },
  filename: function (req, file, cb) {
    const name = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, name + ext);
  },
});

// Initialize multer
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
});

export const imageUpload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: function (req, file, cb) {
    const allowed = /jpeg|jpg|png|pdf|mp4/;
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.test(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only images, PDFs, and MP4s are allowed!'));
    }
  },
});

export default upload;
