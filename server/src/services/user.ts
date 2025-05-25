import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/user";
import { IUser, UserRole } from "../types";
import { BaseService } from "./base";

export class UserService extends BaseService<IUser> {
  protected model = User;
  private static instance: UserService;

  private constructor() {
    super();
  }

  public static getInstance(): UserService {
    if (!UserService.instance) {
      UserService.instance = new UserService();
    }
    return UserService.instance;
  }

  public async register(userData: Partial<IUser>): Promise<{ user: IUser; token: string }> {
    try {
      // Check if user already exists
      const existingUser = await User.findOne({ email: userData.email });
      if (existingUser) {
        throw new Error("User already exists");
      }

      // Hash password
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(userData.password!, saltRounds);

      // Create user
      const user = await this.create({
        ...userData,
        password: hashedPassword,
      });

      // Generate token
      const token = this.generateToken(user._id!, user.role);

      return { user, token };
    } catch (error) {
      throw error;
    }
  }

  public async login(email: string, password: string): Promise<{ user: IUser; token: string }> {
    try {
      // Find user
      const user = await User.findOne({ email });
      if (!user) {
        throw new Error("Invalid credentials");
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        throw new Error("Invalid credentials");
      }

      // Generate token
      const token = this.generateToken(user._id, user.role);

      return { user, token };
    } catch (error) {
      throw error;
    }
  }

  private generateToken(userId: object, role: UserRole): string {
    return jwt.sign({ userId, role }, process.env.JWT_SECRET || "MEDVAULTKEY", { expiresIn: "24h" });
  }

  public verifyToken(token: string): { userId: string; role: UserRole } {
    try {
      return jwt.verify(token, process.env.JWT_SECRET || "MEDVAULTKEY") as { userId: string; role: UserRole };
    } catch (error) {
      throw new Error("Invalid token");
    }
  }
}
