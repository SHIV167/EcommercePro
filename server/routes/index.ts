import express from 'express';
import uploadRoutes from './uploadRoutes';
import { errorHandler } from '../middleware/errorHandler';

const router = express.Router();

// Register routes
router.use(uploadRoutes);

// Error handling middleware should be last
router.use(errorHandler);

export default router;
