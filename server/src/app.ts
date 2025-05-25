import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import { Database } from "./config/database";
import { Routes } from "./routes";

dotenv.config();

export class App {
  private app: express.Application;
  private database: Database;
  private routes: Routes;

  constructor() {
    this.app = express();
    this.database = Database.getInstance();
    this.routes = new Routes();

    this.initializeMiddleware();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  private initializeMiddleware(): void {
    // Security middleware
    this.app.use(helmet());
    this.app.use(
      cors({
        origin: process.env.FRONTEND_URL || "http://localhost:3000",
        credentials: true,
      })
    );

    // Rate limiting
    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limit each IP to 100 requests per windowMs
    });
    this.app.use(limiter);

    // Body parsing middleware
    this.app.use(express.json({ limit: "10mb" }));
    this.app.use(express.urlencoded({ extended: true }));
  }

  private initializeRoutes(): void {
    // Health check
    this.app.get("/health", (req, res) => {
      res.json({ status: "OK", timestamp: new Date().toISOString() });
    });

    // API routes
    this.app.use("/api", this.routes.getRouter());
  }

  private initializeErrorHandling(): void {
    // 404 handler
    this.app.use("*", (req, res) => {
      res.status(404).json({
        success: false,
        message: "Route not found",
      });
    });

    // Global error handler
    this.app.use((error: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
      console.error("Global Error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
        error: process.env.NODE_ENV === "development" ? error.stack : undefined,
      });
    });
  }

  public async start(): Promise<void> {
    try {
      await this.database.connect();
      const port = process.env.PORT || 3000;

      this.app.listen(port, () => {
        console.log(`MedVault API Server running on port ${port}`);
        console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
      });
    } catch (error) {
      console.error("Failed to start server:", error);
      process.exit(1);
    }
  }

  public getApp(): express.Application {
    return this.app;
  }
}

// Start the application
if (require.main === module) {
  const app = new App();
  app.start();
}
