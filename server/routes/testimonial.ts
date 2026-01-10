import { Router, Request, Response } from 'express';
import { getAllTestimonials, addTestimonial, updateTestimonial, deleteTestimonial } from '../../backendgogame/actions/testimonials';
import { toErrorMessage } from '../../backendgogame/lib/errors';

const router = Router();

// GET /api/testimonial-management
router.get('/', async (req: Request, res: Response) => {
  try {
    const response = await getAllTestimonials();
    res.json(response);
  } catch (error) {
    console.error('Get testimonials error:', error);
    res.status(500).json({
      success: false,
      message: toErrorMessage(error, 'Failed to fetch testimonials')
    });
  }
});

// POST /api/testimonial-management/add-review
router.post('/add-review', async (req: Request, res: Response) => {
  try {
    const response = await addTestimonial(req.body);
    res.status(201).json(response);
  } catch (error) {
    console.error('Add testimonial error:', error);
    res.status(500).json({
      success: false,
      message: toErrorMessage(error, 'Failed to add testimonial')
    });
  }
});

// PUT /api/testimonial-management/:id
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const response = await updateTestimonial(id, req.body);
    res.json(response);
  } catch (error) {
    console.error('Update testimonial error:', error);
    res.status(500).json({
      success: false,
      message: toErrorMessage(error, 'Failed to update testimonial')
    });
  }
});

// DELETE /api/testimonial-management/:id
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const response = await deleteTestimonial(id);
    res.json(response);
  } catch (error) {
    console.error('Delete testimonial error:', error);
    res.status(500).json({
      success: false,
      message: toErrorMessage(error, 'Failed to delete testimonial')
    });
  }
});

export default router;

