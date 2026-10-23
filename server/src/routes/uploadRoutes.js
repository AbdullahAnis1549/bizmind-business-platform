import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import cloudinary from '../config/cloudinary.js';
import upload from '../middleware/uploadMiddleware.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, '../../uploads');

// Ensure uploads folder exists
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// @desc Upload image to Cloudinary (or local fallback)
// @route POST /api/upload
router.post('/', protect, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided.',
      });
    }

    const folder = req.query.folder || 'bizmind/general';
    const isCloudinaryConfigured = Boolean(
      process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
    );

    if (isCloudinaryConfigured) {
      try {
        const result = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            {
              folder,
              resource_type: 'image',
              transformation: [
                { width: 800, height: 800, crop: 'limit', quality: 'auto:good' },
              ],
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
          stream.end(req.file.buffer);
        });

        return res.json({
          success: true,
          url: result.secure_url,
          publicId: result.public_id,
          source: 'cloudinary',
          message: 'Image uploaded to Cloudinary successfully.',
        });
      } catch (cloudErr) {
        console.warn('[Upload] Cloudinary upload failed, falling back to local storage:', cloudErr.message);
      }
    }

    // Local file fallback if Cloudinary is not configured or failed
    const ext = path.extname(req.file.originalname) || '.jpg';
    const cleanExt = ['.png', '.jpg', '.jpeg', '.webp', '.gif'].includes(ext.toLowerCase()) ? ext.toLowerCase() : '.jpg';
    const filename = `img_${Date.now()}_${Math.round(Math.random() * 1e8)}${cleanExt}`;
    const targetPath = path.join(uploadsDir, filename);

    fs.writeFileSync(targetPath, req.file.buffer);

    const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'http';
    const host = req.get('host');
    const fileUrl = `${protocol}://${host}/uploads/${filename}`;

    return res.json({
      success: true,
      url: fileUrl,
      source: 'local',
      message: 'Image uploaded successfully.',
    });
  } catch (error) {
    console.error('[Upload] Error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Image upload failed. Please try again.',
    });
  }
});

export default router;

