import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Provide __dirname in ES module scope
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Base upload directory
const baseUploadDir = path.join(__dirname, '../../public/uploads');

// Ensure directories exist
const directories = {
  products: path.join(baseUploadDir, 'products'),
  banners: path.join(baseUploadDir, 'banners'),
  default: baseUploadDir
};

// Create directories if they don't exist
Object.values(directories).forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// Helper function to determine upload directory
const getUploadPath = (req: any) => {
  const path = req.path.toLowerCase();
  if (path.includes('/banners')) return directories.banners;
  if (path.includes('/products')) return directories.products;
  return directories.default;
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = getUploadPath(req);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Clean the original filename
    const cleanFileName = file.originalname.toLowerCase().replace(/[^a-z0-9.]/g, '-');
    // Add timestamp to ensure uniqueness
    cb(null, `${Date.now()}-${cleanFileName}`);
  }
});

const fileFilter = (req: any, file: any, cb: any) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG and WebP images are allowed.'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  }
});

export default upload;
