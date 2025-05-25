import { Router } from "express";
import { AuthController } from "../controllers/auth";
import { BabyController } from "../controllers/baby";
import { VaccinationController } from "../controllers/vaccination";
import { NCDPatientController } from "../controllers/ncd-patient";
import { AuthMiddleware } from "../midddleware/auth";
import { UserRole } from "../types";

export class Routes {
  private router: Router;
  private authController: AuthController;
  private babyController: BabyController;
  private vaccinationController: VaccinationController;
  private ncdPatientController: NCDPatientController;
  private authMiddleware: AuthMiddleware;

  constructor() {
    this.router = Router();
    this.authController = new AuthController();
    this.babyController = new BabyController();
    this.vaccinationController = new VaccinationController();
    this.ncdPatientController = new NCDPatientController();
    this.authMiddleware = new AuthMiddleware();

    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    // Auth routes
    this.router.post("/auth/register", this.authController.register);
    this.router.post("/auth/login", this.authController.login);

    // Baby routes
    this.router.post(
      "/babies",
      this.authMiddleware.authenticate,
      this.authMiddleware.authorize([UserRole.PARENT]),
      this.babyController.createBaby
    );

    this.router.get(
      "/babies",
      this.authMiddleware.authenticate,
      this.authMiddleware.authorize([UserRole.PARENT, UserRole.HEALTHCARE_PROVIDER]),
      this.babyController.getBabies
    );

    this.router.get(
      "/babies/:id",
      this.authMiddleware.authenticate,
      this.authMiddleware.authorize([UserRole.PARENT, UserRole.HEALTHCARE_PROVIDER]),
      this.babyController.getBabyById
    );

    this.router.put(
      "/babies/:id",
      this.authMiddleware.authenticate,
      this.authMiddleware.authorize([UserRole.PARENT, UserRole.HEALTHCARE_PROVIDER]),
      this.babyController.updateBaby
    );

    this.router.delete(
      "/babies/:id",
      this.authMiddleware.authenticate,
      this.authMiddleware.authorize([UserRole.PARENT, UserRole.HEALTHCARE_PROVIDER]),
      this.babyController.deleteBaby
    );

    // Vaccination routes
    this.router.post(
      "/vaccinations",
      this.authMiddleware.authenticate,
      this.authMiddleware.authorize([UserRole.HEALTHCARE_PROVIDER]),
      this.vaccinationController.createVaccination
    );

    this.router.get(
      "/babies/:babyId/vaccinations",
      this.authMiddleware.authenticate,
      this.authMiddleware.authorize([UserRole.PARENT, UserRole.HEALTHCARE_PROVIDER]),
      this.vaccinationController.getVaccinationsByBaby
    );

    this.router.get(
      "/vaccinations/upcoming",
      this.authMiddleware.authenticate,
      this.authMiddleware.authorize([UserRole.HEALTHCARE_PROVIDER]),
      this.vaccinationController.getUpcomingVaccinations
    );

    this.router.get(
      "/vaccinations/stats",
      this.authMiddleware.authenticate,
      this.authMiddleware.authorize([UserRole.HEALTHCARE_PROVIDER]),
      this.vaccinationController.getVaccinationStats
    );

    this.router.put(
      "/vaccinations/:id",
      this.authMiddleware.authenticate,
      this.authMiddleware.authorize([UserRole.HEALTHCARE_PROVIDER]),
      this.vaccinationController.updateVaccination
    );

    // NCD Patient routes
    this.router.post(
      "/ncd-patients",
      this.authMiddleware.authenticate,
      this.authMiddleware.authorize([UserRole.NCD_PATIENT, UserRole.HEALTHCARE_PROVIDER]),
      this.ncdPatientController.createNCDPatient
    );

    this.router.get(
      "/ncd-patients",
      this.authMiddleware.authenticate,
      this.authMiddleware.authorize([UserRole.NCD_PATIENT, UserRole.HEALTHCARE_PROVIDER]),
      this.ncdPatientController.getNCDPatients
    );

    this.router.get(
      "/ncd-patients/:id",
      this.authMiddleware.authenticate,
      this.authMiddleware.authorize([UserRole.NCD_PATIENT, UserRole.HEALTHCARE_PROVIDER]),
      this.ncdPatientController.getNCDPatientById
    );

    this.router.put(
      "/ncd-patients/:id",
      this.authMiddleware.authenticate,
      this.authMiddleware.authorize([UserRole.NCD_PATIENT, UserRole.HEALTHCARE_PROVIDER]),
      this.ncdPatientController.updateNCDPatient
    );

    this.router.get(
      "/ncd-patients/stats/overview",
      this.authMiddleware.authenticate,
      this.authMiddleware.authorize([UserRole.HEALTHCARE_PROVIDER]),
      this.ncdPatientController.getNCDStats
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
