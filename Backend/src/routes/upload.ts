import express, { Request, Response, IRouter } from 'express';
import { upload, cloudinary } from '../config/cloudinary';

const router: IRouter = express.Router();

// Upload single image
router.post('/image', upload.single('image'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'No image file provided' 
      });
    }

    const file = req.file as Express.Multer.File & { path?: string };
    
    res.json({
      success: true,
      message: 'Image uploaded successfully',
      url: file.path, // Return url directly for frontend compatibility
      data: {
        url: file.path,
        filename: file.filename,
      },
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error uploading image',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Delete image from Cloudinary
router.delete('/image/:publicId', async (req: Request, res: Response) => {
  try {
    const { publicId } = req.params;
    
    // Need to include folder in publicId
    const fullPublicId = `amr-kofta-menu/${publicId}`;
    
    const result = await cloudinary.uploader.destroy(fullPublicId);
    
    if (result.result === 'ok') {
      res.json({
        success: true,
        message: 'Image deleted successfully',
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Image not found',
      });
    }
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error deleting image',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
