import { Request, Response } from "express";
import Joi from "joi";
import { BaseController } from "./base";
import { UserService } from "../services/user";
import { UserRole } from "../types";

export class AuthController extends BaseController {
  private userService: UserService;

  constructor() {
    super();
    this.userService = UserService.getInstance();
  }

  private validateRegistration = (data: any) => {
    const schema = Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().min(6).required(),
      role: Joi.string()
        .valid(...Object.values(UserRole))
        .required(),
      firstName: Joi.string().required(),
      lastName: Joi.string().required(),
      phoneNumber: Joi.string().optional(),
      facilityName: Joi.string().when("role", {
        is: UserRole.HEALTHCARE_PROVIDER,
        then: Joi.required(),
        otherwise: Joi.optional(),
      }),
    });

    return schema.validate(data);
  };

  private validateLogin = (data: any) => {
    const schema = Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().required(),
    });

    return schema.validate(data);
  };

  public register = async (req: Request, res: Response): Promise<void> => {
    try {
      const { error, value } = this.validateRegistration(req.body);
      if (error) {
        this.handleValidationError(res, error.details);
        return;
      }

      const result = await this.userService.register(value);
      this.handleSuccess(res, result, "User registered successfully", 201);
    } catch (error) {
      this.handleError(res, error, 400);
    }
  };

  public login = async (req: Request, res: Response): Promise<void> => {
    try {
      const { error, value } = this.validateLogin(req.body);
      if (error) {
        this.handleValidationError(res, error.details);
        return;
      }

      const result = await this.userService.login(value.email, value.password);
      this.handleSuccess(res, result, "Login successful");
    } catch (error) {
      this.handleError(res, error, 401);
    }
  };
}
