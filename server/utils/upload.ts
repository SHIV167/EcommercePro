import multer from 'multer';
import cloudinary, { isCloudinaryConfigured } from './cloudinary';
import type { UploadApiOptions } from 'cloudinary';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Extend the Express.Multer.File interface to include location
declare global {
  namespace Express {
    namespace Multer {
      interface File {
        location?: string;
        secure_url?: string;
      }
    }
  }
}

// Get current file path and directory in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(process.cwd(), 'uploads');
const bannersDir = path.join(uploadsDir, 'banners');
const productsDir = path.join(uploadsDir, 'products');

// Create directories if they don't exist
for (const dir of [uploadsDir, bannersDir, productsDir]) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// Use memory storage for temporary files before Cloudinary upload
// This avoids saving files to disk first and having local URLs
const storage = multer.memoryStorage();

// File filter for image types
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  console.log(`[UPLOAD] Filtering file: ${file.originalname}, type: ${file.mimetype}`);
  
  if (!file.mimetype) {
    console.error('[UPLOAD] No mimetype provided for file:', file.originalname);
    return cb(new Error('File type could not be determined'));
  }
  
  if (file.mimetype.startsWith('image/')) {
    console.log(`[UPLOAD] Accepting file: ${file.originalname}`);
    cb(null, true);
  } else {
    const error = new Error(`Invalid file type: ${file.mimetype}. Only image files are allowed.`);
    console.error('[UPLOAD] Rejected file:', file.originalname, 'Reason:', error.message);
    cb(error);
  }
};

// Create base multer instance with file size limit
const baseUpload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 2 // Maximum of 2 files
  }
});

// Create wrapped upload functions for Cloudinary
const createCloudinaryUpload = async (file: Express.Multer.File, req: any): Promise<{ secure_url: string }> => {
  return new Promise((resolve, reject) => {
    if (!isCloudinaryConfigured) {
      console.error('[CLOUDINARY] Cloudinary not configured');
      return reject(new Error('Cloudinary configuration is required for file uploads'));
    }

    const isForBanners = req.originalUrl.includes('/banners');
    const folder = isForBanners ? 'banners' : 'products';
    
    console.log('[CLOUDINARY] Processing file for upload:', {
      filename: file.originalname,
      folder: folder,
      size: file.size,
      mimetype: file.mimetype,
      hasBuffer: !!file.buffer,
      hasPath: !!file.path
    });

    // Define upload options with proper typing
    const uploadOptions = {
      folder: folder,
      resource_type: 'auto' as const,
      transformation: [
        { quality: 'auto:good' as const },
        { fetch_format: 'auto' as const },
        { flags: 'progressive' as const }
      ]
    } as const;

    // Function to handle the upload result
    const handleUploadResult = (error: any, result: any) => {
      if (error || !result) {
        console.error('[CLOUDINARY] Upload error:', error);
        return reject(error || new Error('No result from Cloudinary'));
      }
      
      // Ensure we have a secure URL
      const secureUrl = result.secure_url || 
                       `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/${result.public_id}`;
      
      // Store the Cloudinary URL in the file object
      file.path = secureUrl;
      (file as any).location = secureUrl;
      (file as any).secure_url = secureUrl;
      
      console.log('[CLOUDINARY] Upload success:', {
        publicId: result.public_id,
        url: secureUrl
      });
      
      resolve({ secure_url: secureUrl });
    };

    // If we have a buffer, use upload_stream
    if (file.buffer) {
      console.log('[CLOUDINARY] Uploading from buffer');
      const uploadStream = cloudinary.uploader.upload_stream(
        uploadOptions,
        handleUploadResult
      );
      uploadStream.end(file.buffer);
    }
    // If we have a path, use regular upload
    else if (file.path) {
      console.log('[CLOUDINARY] Uploading from path:', file.path);
      cloudinary.uploader.upload(file.path, uploadOptions, handleUploadResult);
    }
    // No valid source for upload
    else {
      console.error('[CLOUDINARY] No valid source for upload');
      reject(new Error('No buffer or file path available for upload'));
    }
  });
};

// Create wrapped upload middleware
const createWrappedMiddleware = (handler: any) => {
  return async (req: any, res: any, next: any) => {
    try {
      console.log('[UPLOAD] Starting file upload');
      
      // Process the upload
      await new Promise<void>((resolve, reject) => {
        handler(req, res, (err: any) => {
          if (err) {
            console.error('[UPLOAD] Error in upload middleware:', err);
            return reject(err);
          }
          resolve();
        });
      });

      // Process files if they exist
      if (req.file) {
        console.log('[UPLOAD] Processing single file:', {
          originalname: req.file.originalname,
          mimetype: req.file.mimetype,
          size: req.file.size,
          fieldname: req.file.fieldname,
          hasBuffer: !!req.file.buffer,
          hasPath: !!req.file.path
        });
        
        try {
          const result = await createCloudinaryUpload(req.file, req);
          // Ensure the file object has the Cloudinary URL
          req.file.path = result.secure_url;
          (req.file as any).location = result.secure_url;
          (req.file as any).secure_url = result.secure_url;
          
          console.log('[UPLOAD] Single file processed:', {
            path: req.file.path,
            location: (req.file as any).location,
            secure_url: (req.file as any).secure_url
          });
        } catch (error) {
          console.error('[UPLOAD] Error processing single file:', error);
          throw error;
        }
      } else if (req.files) {
        console.log('[UPLOAD] Processing multiple files:', {
          fields: Object.keys(req.files),
          counts: Object.fromEntries(
            Object.entries(req.files).map(([field, files]) => 
              [field, (files as Express.Multer.File[]).length]
            )
          )
        });
        
        for (const fieldName in req.files) {
          const files = req.files[fieldName] as Express.Multer.File[];
          for (const [index, file] of files.entries()) {
            console.log(`[UPLOAD] Processing ${fieldName}[${index}]:`, {
              originalname: file.originalname,
              mimetype: file.mimetype,
              size: file.size,
              fieldname: file.fieldname,
              hasBuffer: !!file.buffer,
              hasPath: !!file.path
            });
            
            try {
              const result = await createCloudinaryUpload(file, req);
              // Ensure the file object has the Cloudinary URL
              file.path = result.secure_url;
              (file as any).location = result.secure_url;
              (file as any).secure_url = result.secure_url;
              
              console.log(`[UPLOAD] ${fieldName}[${index}] processed:`, {
                path: file.path,
                location: (file as any).location,
                secure_url: (file as any).secure_url
              });
            } catch (error) {
              console.error(`[UPLOAD] Error processing ${fieldName}[${index}]:`, error);
              throw error;
            }
          }
        }
      } else {
        console.log('[UPLOAD] No files to process');
      }
      
      next();
    } catch (error) {
      console.error('[UPLOAD] Error in upload middleware:', error);
      next(error);
    }
  };
};

// Create final upload object with wrapped middleware
const upload = {
  single: (fieldName: string) => createWrappedMiddleware(baseUpload.single(fieldName)),
  array: (fieldName: string, maxCount?: number) => 
    createWrappedMiddleware(baseUpload.array(fieldName, maxCount)),
  fields: (fields: { name: string; maxCount?: number }[]) => 
    createWrappedMiddleware(baseUpload.fields(fields)),
  none: () => createWrappedMiddleware(baseUpload.none())
};

export default upload;
