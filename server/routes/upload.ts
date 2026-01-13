import { Router, Request, Response } from 'express';
import { put } from '@vercel/blob';
import multer from 'multer';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// POST /api/upload-image
router.post('/', upload.single('image'), async (req: Request, res: Response) => {
  try {
    const file = req.file;
    const type = (req.body.type as string) || 'reviews';

    if (!file) {
      return res.status(400).json({
        success: false,
        message: 'No file provided'
      });
    }

    // File validation
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      return res.status(400).json({
        success: false,
        message: 'File size too large (max 5MB)'
      });
    }

    // Check file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.mimetype)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid file type. Only JPEG, PNG, WebP allowed'
      });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const fileExtension = file.originalname.split('.').pop() || 'jpg';
    const filename = `${type}/${timestamp}.${fileExtension}`;
    
    // Upload to Vercel Blob Storage
    const blob = await put(filename, file.buffer, {
      access: 'public',
      contentType: file.mimetype,
    });

    res.json({
      success: true,
      imagePath: blob.url,
      filename: filename
    });
  } catch (error) {
    console.error('Upload image error:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to upload image'
    });
  }
});

export default router;

