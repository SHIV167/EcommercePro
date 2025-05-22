import dotenv from 'dotenv';
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';

// Load environment variables
dotenv.config();

// Configure Cloudinary with your credentials
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Test file path - adjust as needed
const testFilePath = path.join(process.cwd(), 'public', 'uploads', 'banners', 'test-banner.jpg');

// Check if test file exists
if (!fs.existsSync(testFilePath)) {
  console.error(`Test file not found at ${testFilePath}`);
  process.exit(1);
}

async function uploadAndDebug() {
  try {
    console.log('Uploading test file to Cloudinary...');
    
    // Upload directly to Cloudinary for testing
    const result = await cloudinary.uploader.upload(testFilePath, {
      folder: 'banners',
      use_filename: true,
      unique_filename: true
    });
    
    // Log detailed information about the result
    console.log('\n=== CLOUDINARY UPLOAD RESULT ===');
    console.log('Result object keys:', Object.keys(result));
    console.log('Full result:', JSON.stringify(result, null, 2));
    
    // Extract the important URLs
    console.log('\n=== IMPORTANT CLOUDINARY URLS ===');
    console.log('Public ID:', result.public_id);
    console.log('Secure URL (HTTPS):', result.secure_url);
    console.log('URL (might be HTTP):', result.url);
    
    // Build various transformation URLs
    console.log('\n=== SAMPLE TRANSFORMATION URLS ===');
    console.log('Optimized URL for desktop:', 
      result.secure_url.replace('/upload/', '/upload/q_auto:good,f_auto,dpr_auto/'));
    console.log('Optimized URL for mobile:', 
      result.secure_url.replace('/upload/', '/upload/q_auto:good,f_auto,w_768/'));
    
    // Cleanup
    console.log('\nCleaning up...');
    await cloudinary.uploader.destroy(result.public_id);
    console.log('Test image deleted from Cloudinary');
    
  } catch (error) {
    console.error('Error in Cloudinary test:', error);
  }
}

// Run the test
uploadAndDebug().then(() => {
  console.log('\nTest completed');
});
