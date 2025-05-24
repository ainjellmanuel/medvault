import express from 'express';
import { 
  getAllPatients,
  getPatientDetails,
  addVaccinationRecord,
  addNCDRecord,
  getPatientNCDRecords,
  getChildVaccinationRecords
} from '../controllers/adminController';
import { 
  getAllUsers,
  createUser,
  updateUser,
  deleteUser
} from '../controllers/superAdminController';
import { protect } from '../middleware/auth';
import { authorize } from '../middleware/rbac';
import { UserRole } from '../types/user';

const router = express.Router();

// Protect all routes in this router
router.use(protect);

// Admin routes - accessible to both admin and superadmin
router.get('/patients', authorize(UserRole.ADMIN, UserRole.SUPERADMIN), getAllPatients);
router.get('/patients/:id', authorize(UserRole.ADMIN, UserRole.SUPERADMIN), getPatientDetails);
router.post('/vaccinations', authorize(UserRole.ADMIN, UserRole.SUPERADMIN), addVaccinationRecord);
router.post('/ncd-records', authorize(UserRole.ADMIN, UserRole.SUPERADMIN), addNCDRecord);
router.get('/patients/:patientId/ncd-records', authorize(UserRole.ADMIN, UserRole.SUPERADMIN), getPatientNCDRecords);
router.get('/vaccinations/child/:childId', authorize(UserRole.ADMIN, UserRole.SUPERADMIN), getChildVaccinationRecords);

// Superadmin routes - accessible only to superadmin
router.get('/users', authorize(UserRole.SUPERADMIN), getAllUsers);
router.post('/users', authorize(UserRole.SUPERADMIN), createUser);
router.put('/users/:id', authorize(UserRole.SUPERADMIN), updateUser);
router.delete('/users/:id', authorize(UserRole.SUPERADMIN), deleteUser);

export default router;