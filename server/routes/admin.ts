import { Router, Request, Response } from 'express';
import { toErrorMessage } from '../../backendgogame/lib/errors';

const router = Router();

// Import admin actions
import { getAllDates, addDate, updateDate, deleteDate } from '../../backendgogame/actions/dateManagement';
import { getAllBookings, getBookingById, updateBooking } from '../../backendgogame/actions/bookings';
import { getAbout, updateAbout } from '../../backendgogame/actions/about';
import { getSettings, updateSettings } from '../../backendgogame/actions/settings';

// Date Management Routes
router.get('/date-management', async (req: Request, res: Response) => {
  try {
    const response = await getAllDates();
    res.json(response);
  } catch (error) {
    console.error('Get dates error:', error);
    res.status(500).json({
      success: false,
      message: toErrorMessage(error, 'Failed to fetch dates')
    });
  }
});

router.post('/date-management', async (req: Request, res: Response) => {
  try {
    const response = await addDate(req.body);
    res.status(201).json(response);
  } catch (error) {
    console.error('Add date error:', error);
    res.status(500).json({
      success: false,
      message: toErrorMessage(error, 'Failed to add date')
    });
  }
});

router.put('/date-management/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const response = await updateDate(id, req.body);
    res.json(response);
  } catch (error) {
    console.error('Update date error:', error);
    res.status(500).json({
      success: false,
      message: toErrorMessage(error, 'Failed to update date')
    });
  }
});

router.delete('/date-management/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const response = await deleteDate(id);
    res.json(response);
  } catch (error) {
    console.error('Delete date error:', error);
    res.status(500).json({
      success: false,
      message: toErrorMessage(error, 'Failed to delete date')
    });
  }
});

// Bookings Routes
router.get('/all-bookings', async (req: Request, res: Response) => {
  try {
    const response = await getAllBookings();
    res.json(response);
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({
      success: false,
      message: toErrorMessage(error, 'Failed to fetch bookings')
    });
  }
});

router.get('/all-bookings/categorized', async (req: Request, res: Response) => {
  try {
    const response = await getAllBookings();
    // Categorize bookings by status
    const categorized = {
      pending: response.list?.filter((b: any) => b.status === 'pending') || [],
      confirmed: response.list?.filter((b: any) => b.status === 'confirmed') || [],
      completed: response.list?.filter((b: any) => b.status === 'completed') || [],
      cancelled: response.list?.filter((b: any) => b.status === 'cancelled') || []
    };
    res.json({ success: true, data: categorized });
  } catch (error) {
    console.error('Get categorized bookings error:', error);
    res.status(500).json({
      success: false,
      message: toErrorMessage(error, 'Failed to fetch categorized bookings')
    });
  }
});

router.get('/all-bookings/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const response = await getBookingById(id);
    res.json(response);
  } catch (error) {
    console.error('Get booking error:', error);
    res.status(500).json({
      success: false,
      message: toErrorMessage(error, 'Failed to fetch booking')
    });
  }
});

router.put('/all-bookings/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const response = await updateBooking(id, req.body);
    res.json(response);
  } catch (error) {
    console.error('Update booking error:', error);
    res.status(500).json({
      success: false,
      message: toErrorMessage(error, 'Failed to update booking')
    });
  }
});

// About Management Routes (simplified - add more as needed)
router.get('/about-management', async (req: Request, res: Response) => {
  try {
    const response = await getAbout();
    res.json(response);
  } catch (error) {
    console.error('Get about error:', error);
    res.status(500).json({
      success: false,
      message: toErrorMessage(error, 'Failed to fetch about data')
    });
  }
});

router.put('/about-management', async (req: Request, res: Response) => {
  try {
    const response = await updateAbout(req.body);
    res.json(response);
  } catch (error) {
    console.error('Update about error:', error);
    res.status(500).json({
      success: false,
      message: toErrorMessage(error, 'Failed to update about data')
    });
  }
});

// Settings Routes (simplified - add more as needed)
router.get('/settings', async (req: Request, res: Response) => {
  try {
    const response = await getSettings();
    res.json(response);
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({
      success: false,
      message: toErrorMessage(error, 'Failed to fetch settings')
    });
  }
});

router.put('/settings', async (req: Request, res: Response) => {
  try {
    const response = await updateSettings(req.body);
    res.json(response);
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({
      success: false,
      message: toErrorMessage(error, 'Failed to update settings')
    });
  }
});

export default router;

