import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'avatar-' + uniqueSuffix + path.extname(file.originalname));
  },
});

// File filter - only images
const fileFilter = (req: any, file: any, cb: any) => {
  // Check by MIME type first (more reliable)
  const imageRegex = /^image\/(jpeg|jpg|png|gif|webp)$/i;
  if (imageRegex.test(file.mimetype)) {
    return cb(null, true);
  }
  
  // Fallback: check by file extension
  const allowedExtensions = /\.(jpeg|jpg|png|gif|webp)$/i;
  if (allowedExtensions.test(file.originalname)) {
    return cb(null, true);
  }

  // Log details for debugging
  console.log(
    ` [UPLOAD] File validation failed - MIME: ${file.mimetype}, Filename: ${file.originalname}`,
  );
  cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp)'));
};

export const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max
  },
  fileFilter: fileFilter,
});
