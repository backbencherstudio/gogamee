import { Router, Request, Response } from 'express';
import { getAllFaqs, addFaq, updateFaq, deleteFaq } from '../../backendgogame/actions/faq';
import { toErrorMessage } from '../../backendgogame/lib/errors';

const router = Router();

// GET /api/admin/faq
router.get('/', async (req: Request, res: Response) => {
  try {
    const response = await getAllFaqs();
    res.json(response);
  } catch (error) {
    console.error('Get FAQs error:', error);
    res.status(500).json({
      success: false,
      message: toErrorMessage(error, 'Failed to fetch FAQs')
    });
  }
});

// POST /api/admin/faq
router.post('/', async (req: Request, res: Response) => {
  try {
    const response = await addFaq(req.body);
    res.status(201).json(response);
  } catch (error) {
    console.error('Add FAQ error:', error);
    res.status(500).json({
      success: false,
      message: toErrorMessage(error, 'Failed to add FAQ')
    });
  }
});

// PUT /api/admin/faq/:id
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const response = await updateFaq(id, req.body);
    res.json(response);
  } catch (error) {
    console.error('Update FAQ error:', error);
    res.status(500).json({
      success: false,
      message: toErrorMessage(error, 'Failed to update FAQ')
    });
  }
});

// DELETE /api/admin/faq/:id
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const response = await deleteFaq(id);
    res.json(response);
  } catch (error) {
    console.error('Delete FAQ error:', error);
    res.status(500).json({
      success: false,
      message: toErrorMessage(error, 'Failed to delete FAQ')
    });
  }
});

export default router;

