import express from 'express';
import { protect } from '../middleware/auth';
import { authorize } from '../middleware/rbac';
import { UserRole } from '../types/user';

const router = express.Router();

// Protect all routes in this router
router.use(protect);

// Route for getting user profile is already in auth routes

export default router;
