import { Request, Response } from "express";
import Joi from "joi";
import { BaseController } from "./BaseController";
import { VaccinationService } from "../services/VaccinationService";
import { BabyService } from "../services/BabyService";
import { UserRole, VaccineType } from "../types";

interface AuthRequest extends Request {
  user?: { userId: string; role: UserRole };
}

export class VaccinationController extends BaseController {
  private vaccinationService: VaccinationService;
  private babyService: BabyService;

  constructor() {
    super();
    this.vaccinationService = VaccinationService.getInstance();
    this.babyService = BabyService.getInstance();
  }

  private validateVaccination = (data: any) => {
    const schema = Joi.object({
      babyId: Joi.string().required(),
      vaccineType: Joi.string()
        .valid(...Object.values(VaccineType))
        .required(),
      dateAdministered: Joi.date().required(),
      nextDueDate: Joi.date().optional(),
      batchNumber: Joi.string().optional(),
      notes: Joi.string().optional(),
    });

    return schema.validate(data);
  };

  public createVaccination = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { error, value } = this.validateVaccination(req.body);
      if (error) {
        this.handleValidationError(res, error.details);
        return;
      }

      // Only healthcare providers can add vaccinations
      if (req.user?.role !== UserRole.HEALTHCARE_PROVIDER) {
        res.status(403).json({ error: "Only healthcare providers can add vaccinations" });
        return;
      }

      // Verify baby exists
      const baby = await this.babyService.findById(value.babyId);
      if (!baby) {
        res.status(404).json({ error: "Baby not found" });
        return;
      }

      const vaccinationData = {
        ...value,
        administeredBy: req.user.userId,
      };

      const vaccination = await this.vaccinationService.create(vaccinationData);
      this.handleSuccess(res, vaccination, "Vaccination recorded successfully", 201);
    } catch (error) {
      this.handleError(res, error);
    }
  };

  public getVaccinationsByBaby = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { babyId } = req.params;

      // Verify baby exists and check access
      const baby = await this.babyService.findById(babyId);
      if (!baby) {
        res.status(404).json({ error: "Baby not found" });
        return;
      }

      // Check access permissions
      if (req.user?.role === UserRole.PARENT && baby.parentId !== req.user.userId) {
        res.status(403).json({ error: "Access denied" });
        return;
      }

      const vaccinations = await this.vaccinationService.findByBabyId(babyId);
      this.handleSuccess(res, vaccinations, "Vaccinations retrieved successfully");
    } catch (error) {
      this.handleError(res, error);
    }
  };

  public getUpcomingVaccinations = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      // Only healthcare providers can see all upcoming vaccinations
      if (req.user?.role !== UserRole.HEALTHCARE_PROVIDER) {
        res.status(403).json({ error: "Access denied" });
        return;
      }

      const { days } = req.query;
      const daysNumber = parseInt(days as string) || 30;

      const vaccinations = await this.vaccinationService.getUpcomingVaccinations(daysNumber);
      this.handleSuccess(res, vaccinations, "Upcoming vaccinations retrieved successfully");
    } catch (error) {
      this.handleError(res, error);
    }
  };

  public getVaccinationStats = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      // Only healthcare providers can see vaccination statistics
      if (req.user?.role !== UserRole.HEALTHCARE_PROVIDER) {
        res.status(403).json({ error: "Access denied" });
        return;
      }

      const stats = await this.vaccinationService.getVaccinationStats();
      this.handleSuccess(res, stats, "Vaccination statistics retrieved successfully");
    } catch (error) {
      this.handleError(res, error);
    }
  };

  public updateVaccination = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { error, value } = this.validateVaccination(req.body);

      if (error) {
        this.handleValidationError(res, error.details);
        return;
      }

      // Only healthcare providers can update vaccinations
      if (req.user?.role !== UserRole.HEALTHCARE_PROVIDER) {
        res.status(403).json({ error: "Only healthcare providers can update vaccinations" });
        return;
      }

      const existingVaccination = await this.vaccinationService.findById(id);
      if (!existingVaccination) {
        res.status(404).json({ error: "Vaccination record not found" });
        return;
      }

      const updatedVaccination = await this.vaccinationService.update(id, value);
      this.handleSuccess(res, updatedVaccination, "Vaccination updated successfully");
    } catch (error) {
      this.handleError(res, error);
    }
  };
}
