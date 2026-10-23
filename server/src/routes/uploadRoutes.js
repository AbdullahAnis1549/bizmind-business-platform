import express from 'express';
import cloudinary from '../config/cloudinary.js';
import upload from '../middleware/uploadMiddleware.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// @desc Upload image to Cloudinary
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

    if (!isCloudinaryConfigured) {
      return res.status(500).json({
        success: false,
        message: 'Cloudinary credentials are not configured in environment variables.',
      });
    }

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
  } catch (error) {
    console.error('[Upload] Cloudinary Error:', error.message);
    res.status(500).json({
      success: false,
      message: error.message || 'Image upload failed. Please try again.',
    });
  }
});

export default router;
