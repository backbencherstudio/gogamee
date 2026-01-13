import { Router, Request, Response } from 'express';
import { getAllPackages, getPackageById, addPackage, updatePackage, deletePackage } from '../../backendgogame/actions/packages';
import { getStartingPrice } from '../../backendgogame/actions/packages';
import { toErrorMessage } from '../../backendgogame/lib/errors';

const router = Router();

// GET /api/package/all-packages
router.get('/all-packages', async (req: Request, res: Response) => {
  try {
    const sport = req.query.sport as string | undefined;
    const response = await getAllPackages(sport);
    res.json(response);
  } catch (error) {
    console.error('Get all packages error:', error);
    res.status(500).json({
      success: false,
      message: toErrorMessage(error, 'Failed to fetch packages')
    });
  }
});

// GET /api/package/sports
router.get('/sports', async (req: Request, res: Response) => {
  try {
    const response = await getAllPackages();
    const sports = [...new Set(response.list?.map((p: any) => p.sport) || [])];
    res.json({ success: true, sports });
  } catch (error) {
    console.error('Get sports error:', error);
    res.status(500).json({
      success: false,
      message: toErrorMessage(error, 'Failed to fetch sports')
    });
  }
});

// GET /api/package/starting-price/:sport
router.get('/starting-price/:sport', async (req: Request, res: Response) => {
  try {
    const { sport } = req.params;
    const response = await getStartingPrice(sport as 'football' | 'basketball' | 'combined');
    res.json(response);
  } catch (error) {
    console.error('Get starting price error:', error);
    res.status(500).json({
      success: false,
      message: toErrorMessage(error, 'Failed to fetch starting price')
    });
  }
});

// GET /api/package/:id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const response = await getPackageById(id);
    res.json(response);
  } catch (error) {
    console.error('Get package error:', error);
    res.status(500).json({
      success: false,
      message: toErrorMessage(error, 'Failed to fetch package')
    });
  }
});

// POST /api/package/add-product
router.post('/add-product', async (req: Request, res: Response) => {
  try {
    const response = await addPackage(req.body);
    res.status(201).json(response);
  } catch (error) {
    console.error('Add package error:', error);
    res.status(500).json({
      success: false,
      message: toErrorMessage(error, 'Failed to add package')
    });
  }
});

// PUT /api/package/:id
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const response = await updatePackage(id, req.body);
    res.json(response);
  } catch (error) {
    console.error('Update package error:', error);
    res.status(500).json({
      success: false,
      message: toErrorMessage(error, 'Failed to update package')
    });
  }
});

// DELETE /api/package/:id
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const response = await deletePackage(id);
    res.json(response);
  } catch (error) {
    console.error('Delete package error:', error);
    res.status(500).json({
      success: false,
      message: toErrorMessage(error, 'Failed to delete package')
    });
  }
});

export default router;

