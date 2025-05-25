import { Request, Response, NextFunction } from "express";
import { UserService } from "../services/UserService";
import { UserRole } from "../types";

interface AuthRequest extends Request {
  user?: { userId: string; role: UserRole };
}

export class AuthMiddleware {
  private userService: UserService;

  constructor() {
    this.userService = UserService.getInstance();
  }

  public authenticate = (req: AuthRequest, res: Response, next: NextFunction): void => {
    try {
      const token = req.header("Authorization")?.replace("Bearer ", "");

      if (!token) {
        res.status(401).json({ error: "Access denied. No token provided." });
        return;
      }

      const decoded = this.userService.verifyToken(token);
      req.user = decoded;
      next();
    } catch (error) {
      res.status(401).json({ error: "Invalid token." });
    }
  };

  public authorize = (roles: UserRole[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction): void => {
      if (!req.user) {
        res.status(401).json({ error: "Access denied. User not authenticated." });
        return;
      }

      if (!roles.includes(req.user.role)) {
        res.status(403).json({ error: "Access denied. Insufficient permissions." });
        return;
      }

      next();
    };
  };
}
