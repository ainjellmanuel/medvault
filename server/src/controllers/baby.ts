import { Request, Response } from "express";
import Joi from "joi";
import { BaseController } from "./base";
import { BabyService } from "../services/baby";
import { UserRole } from "../types";

interface AuthRequest extends Request {
  user?: { userId: string; role: UserRole };
}

export class BabyController extends BaseController {
  private babyService: BabyService;

  constructor() {
    super();
    this.babyService = BabyService.getInstance();
  }

  private validateBaby = (data: any) => {
    const schema = Joi.object({
      firstName: Joi.string().required(),
      lastName: Joi.string().required(),
      dateOfBirth: Joi.date().required(),
      gender: Joi.string().valid("male", "female").required(),
      birthWeight: Joi.number().positive().optional(),
      birthHeight: Joi.number().positive().optional(),
      bloodType: Joi.string().optional(),
      allergies: Joi.array().items(Joi.string()).optional(),
    });

    return schema.validate(data);
  };

  public createBaby = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { error, value } = this.validateBaby(req.body);
      if (error) {
        this.handleValidationError(res, error.details);
        return;
      }

      // Only parents can create babies for themselves
      if (req.user?.role !== UserRole.PARENT) {
        res.status(403).json({ error: "Only parents can add babies" });
        return;
      }

      const babyData = {
        ...value,
        parentId: req.user.userId,
      };

      const baby = await this.babyService.create(babyData);
      this.handleSuccess(res, baby, "Baby created successfully", 201);
    } catch (error) {
      this.handleError(res, error);
    }
  };

  public getBabies = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { search, limit, page } = req.query;
      const pageNumber = parseInt(page as string) || 1;
      const limitNumber = parseInt(limit as string) || 10;
      const skip = (pageNumber - 1) * limitNumber;

      let babies;

      if (req.user?.role === UserRole.PARENT) {
        // Parents can only see their own babies
        babies = await this.babyService.findByParentId(req.user.userId);
      } else if (req.user?.role === UserRole.HEALTHCARE_PROVIDER) {
        // Healthcare providers can see all babies
        if (search) {
          babies = await this.babyService.searchBabies(search as string, limitNumber);
        } else {
          babies = await this.babyService.findAll({}, limitNumber, skip);
        }
      } else {
        res.status(403).json({ error: "Access denied" });
        return;
      }

      this.handleSuccess(res, babies, "Babies retrieved successfully");
    } catch (error) {
      this.handleError(res, error);
    }
  };

  public getBabyById = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const baby = await this.babyService.findById(id);

      if (!baby) {
        res.status(404).json({ error: "Baby not found" });
        return;
      }

      // Check access permissions
      if (req.user?.role === UserRole.PARENT && baby.parentId !== req.user.userId) {
        res.status(403).json({ error: "Access denied" });
        return;
      }

      this.handleSuccess(res, baby, "Baby retrieved successfully");
    } catch (error) {
      this.handleError(res, error);
    }
  };

  public updateBaby = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { error, value } = this.validateBaby(req.body);

      if (error) {
        this.handleValidationError(res, error.details);
        return;
      }

      const existingBaby = await this.babyService.findById(id);
      if (!existingBaby) {
        res.status(404).json({ error: "Baby not found" });
        return;
      }

      // Check access permissions
      if (req.user?.role === UserRole.PARENT && existingBaby.parentId !== req.user.userId) {
        res.status(403).json({ error: "Access denied" });
        return;
      }

      const updatedBaby = await this.babyService.update(id, value);
      this.handleSuccess(res, updatedBaby, "Baby updated successfully");
    } catch (error) {
      this.handleError(res, error);
    }
  };

  public deleteBaby = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const existingBaby = await this.babyService.findById(id);

      if (!existingBaby) {
        res.status(404).json({ error: "Baby not found" });
        return;
      }

      // Check access permissions
      if (req.user?.role === UserRole.PARENT && existingBaby.parentId !== req.user.userId) {
        res.status(403).json({ error: "Access denied" });
        return;
      }

      await this.babyService.delete(id);
      this.handleSuccess(res, null, "Baby deleted successfully");
    } catch (error) {
      this.handleError(res, error);
    }
  };
}
