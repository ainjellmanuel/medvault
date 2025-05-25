import { Request, Response } from "express";

export abstract class BaseController {
  protected handleSuccess(res: Response, data: any, message: string = "Success", statusCode: number = 200): void {
    res.status(statusCode).json({
      success: true,
      message,
      data,
    });
  }

  protected handleError(res: Response, error: any, statusCode: number = 500): void {
    console.error("Controller Error:", error);
    res.status(statusCode).json({
      success: false,
      message: error.message || "Internal server error",
      error: process.env.NODE_ENV === "development" ? error : undefined,
    });
  }

  protected handleValidationError(res: Response, errors: any[]): void {
    res.status(400).json({
      success: false,
      message: "Validation failed",
      errors,
    });
  }
}
