import { Request, Response } from "express";
import Joi from "joi";
import { BaseController } from "./base";
import { NCDPatientService } from "../services/ncd-patient";
import { UserRole, NCDType } from "../types";

interface AuthRequest extends Request {
  user?: { userId: string; role: UserRole };
}

export class NCDPatientController extends BaseController {
  private ncdPatientService: NCDPatientService;

  constructor() {
    super();
    this.ncdPatientService = NCDPatientService.getInstance();
  }

  private validateNCDPatient = (data: any) => {
    const schema = Joi.object({
      dateOfBirth: Joi.date().required(),
      gender: Joi.string().valid("male", "female").required(),
      emergencyContact: Joi.object({
        name: Joi.string().required(),
        relationship: Joi.string().required(),
        phoneNumber: Joi.string().required(),
      }).required(),
      medicalHistory: Joi.object({
        ncdTypes: Joi.array()
          .items(Joi.string().valid(...Object.values(NCDType)))
          .required(),
        diagnosisDate: Joi.date().required(),
        medications: Joi.array().items(Joi.string()).optional(),
        allergies: Joi.array().items(Joi.string()).optional(),
        familyHistory: Joi.array().items(Joi.string()).optional(),
      }).required(),
    });

    return schema.validate(data);
  };

  public createNCDPatient = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { error, value } = this.validateNCDPatient(req.body);
      if (error) {
        this.handleValidationError(res, error.details);
        return;
      }

      // NCD patients can create their own profile, healthcare providers can create for any user
      let userId = req.user?.userId;

      if (req.user?.role === UserRole.HEALTHCARE_PROVIDER && req.body.userId) {
        userId = req.body.userId;
      } else if (req.user?.role !== UserRole.NCD_PATIENT && req.user?.role !== UserRole.HEALTHCARE_PROVIDER) {
        res.status(403).json({ error: "Access denied" });
        return;
      }

      // Check if patient profile already exists
      const existingPatient = await this.ncdPatientService.findByUserId(userId!);
      if (existingPatient) {
        res.status(400).json({ error: "NCD patient profile already exists" });
        return;
      }

      const patientData = {
        ...value,
        userId: userId!,
      };

      const patient = await this.ncdPatientService.create(patientData);
      this.handleSuccess(res, patient, "NCD patient profile created successfully", 201);
    } catch (error) {
      this.handleError(res, error);
    }
  };

  public getNCDPatients = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { search, limit, page } = req.query;
      const pageNumber = parseInt(page as string) || 1;
      const limitNumber = parseInt(limit as string) || 10;
      const skip = (pageNumber - 1) * limitNumber;

      let patients;

      if (req.user?.role === UserRole.NCD_PATIENT) {
        // NCD patients can only see their own profile
        patients = [await this.ncdPatientService.findByUserId(req.user.userId)].filter(Boolean);
      } else if (req.user?.role === UserRole.HEALTHCARE_PROVIDER) {
        // Healthcare providers can see all patients
        if (search) {
          patients = await this.ncdPatientService.searchPatients(search as string, limitNumber);
        } else {
          patients = await this.ncdPatientService.findAll({}, limitNumber, skip);
        }
      } else {
        res.status(403).json({ error: "Access denied" });
        return;
      }

      this.handleSuccess(res, patients, "NCD patients retrieved successfully");
    } catch (error) {
      this.handleError(res, error);
    }
  };

  public getNCDPatientById = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const patient = await this.ncdPatientService.findById(id);

      if (!patient) {
        res.status(404).json({ error: "NCD patient not found" });
        return;
      }

      // Check access permissions
      if (req.user?.role === UserRole.NCD_PATIENT && patient.userId !== req.user.userId) {
        res.status(403).json({ error: "Access denied" });
        return;
      }

      this.handleSuccess(res, patient, "NCD patient retrieved successfully");
    } catch (error) {
      this.handleError(res, error);
    }
  };

  public updateNCDPatient = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { error, value } = this.validateNCDPatient(req.body);

      if (error) {
        this.handleValidationError(res, error.details);
        return;
      }

      const existingPatient = await this.ncdPatientService.findById(id);
      if (!existingPatient) {
        res.status(404).json({ error: "NCD patient not found" });
        return;
      }

      // Check access permissions
      if (req.user?.role === UserRole.NCD_PATIENT && existingPatient.userId !== req.user.userId) {
        res.status(403).json({ error: "Access denied" });
        return;
      }

      const updatedPatient = await this.ncdPatientService.update(id, value);
      this.handleSuccess(res, updatedPatient, "NCD patient updated successfully");
    } catch (error) {
      this.handleError(res, error);
    }
  };

  public getNCDStats = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      // Only healthcare providers can see NCD statistics
      if (req.user?.role !== UserRole.HEALTHCARE_PROVIDER) {
        res.status(403).json({ error: "Access denied" });
        return;
      }

      const stats = await this.ncdPatientService.getNCDStats();
      this.handleSuccess(res, stats, "NCD statistics retrieved successfully");
    } catch (error) {
      this.handleError(res, error);
    }
  };
}
