import multer from 'multer';

// Setup storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'temp/'); // Uploads go to /uploads
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  },
});

// Initialize multer
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
});

export default upload;
