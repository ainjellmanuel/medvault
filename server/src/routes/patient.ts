import express from 'express';
import { 
  createPatientProfile, 
  getPatientProfile, 
  updatePatientProfile,
  getChildVaccinations,
  getNCDRecords
} from '../controllers/patientController';
import { protect } from '../middleware/auth';
import { authorize } from '../middleware/rbac';
import { UserRole } from '../types/user';

const router = express.Router();

// Protect all routes in this router
router.use(protect);

// Patient routes - accessible only to patients
router.post('/profile', authorize(UserRole.PATIENT), createPatientProfile);
router.get('/profile', authorize(UserRole.PATIENT), getPatientProfile);
router.put('/profile', authorize(UserRole.PATIENT), updatePatientProfile);
router.get('/vaccinations/:childId', authorize(UserRole.PATIENT), getChildVaccinations);
router.get('/ncd-records', authorize(UserRole.PATIENT), getNCDRecords);

export default router;