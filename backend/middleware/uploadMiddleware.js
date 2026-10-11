const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
    cb(null, `snapfit-${uniqueSuffix}${ext}`);
  }
});

// Allowed MIME types & extensions
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (ALLOWED_MIME_TYPES.includes(file.mimetype) || ALLOWED_EXTENSIONS.includes(ext)) {
    cb(null, true);
  } else {
    const error = new Error('Only image files are allowed');
    error.code = 'INVALID_FILE_TYPE';
    cb(error, false);
  }
};

const multerInstance = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10 MB limit
  },
  fileFilter
});

const singleUpload = multerInstance.single('image');

// Middleware wrapper for strict image upload (e.g. food analysis)
const uploadMiddleware = (req, res, next) => {
  singleUpload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          message: 'Image size exceeds 10MB limit'
        });
      }
      return res.status(400).json({
        success: false,
        message: err.message || 'Image upload error'
      });
    } else if (err) {
      return res.status(400).json({
        success: false,
        message: err.message || 'Only image files are allowed'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Food image is required'
      });
    }

    next();
  });
};

// Optional image upload middleware (for meals logging where photo is optional)
const optionalUploadMiddleware = (req, res, next) => {
  singleUpload(req, res, (err) => {
    if (err) {
      console.warn('Optional upload skipped/error:', err.message);
    }
    next();
  });
};

uploadMiddleware.optional = optionalUploadMiddleware;
uploadMiddleware.multer = multerInstance;

module.exports = uploadMiddleware;
