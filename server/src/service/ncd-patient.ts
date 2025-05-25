import { NCDPatient } from "../models/NCDPatient";
import { INCDPatient } from "../types";
import { BaseService } from "./BaseService";

export class NCDPatientService extends BaseService<INCDPatient> {
  protected model = NCDPatient;
  private static instance: NCDPatientService;

  private constructor() {
    super();
  }

  public static getInstance(): NCDPatientService {
    if (!NCDPatientService.instance) {
      NCDPatientService.instance = new NCDPatientService();
    }
    return NCDPatientService.instance;
  }

  public async findByUserId(userId: string): Promise<INCDPatient | null> {
    try {
      return await NCDPatient.findOne({ userId }).populate("userId", "firstName lastName email phoneNumber");
    } catch (error) {
      throw new Error(`Error finding NCD patient: ${error}`);
    }
  }

  public async searchPatients(query: string, limit?: number): Promise<INCDPatient[]> {
    try {
      let searchQuery = NCDPatient.find().populate({
        path: "userId",
        match: {
          $or: [
            { firstName: new RegExp(query, "i") },
            { lastName: new RegExp(query, "i") },
            { email: new RegExp(query, "i") },
          ],
        },
        select: "firstName lastName email phoneNumber",
      });

      if (limit) {
        searchQuery = searchQuery.limit(limit);
      }

      const results = await searchQuery.exec();
      return results.filter((patient) => patient.userId); // Filter out null matches
    } catch (error) {
      throw new Error(`Error searching NCD patients: ${error}`);
    }
  }

  public async getNCDStats(): Promise<any> {
    try {
      const stats = await NCDPatient.aggregate([
        { $unwind: "$medicalHistory.ncdTypes" },
        {
          $group: {
            _id: "$medicalHistory.ncdTypes",
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
      ]);

      const ageGroups = await NCDPatient.aggregate([
        {
          $addFields: {
            age: {
              $floor: {
                $divide: [{ $subtract: [new Date(), "$dateOfBirth"] }, 365.25 * 24 * 60 * 60 * 1000],
              },
            },
          },
        },
        {
          $group: {
            _id: {
              $switch: {
                branches: [
                  { case: { $lt: ["$age", 30] }, then: "18-29" },
                  { case: { $lt: ["$age", 40] }, then: "30-39" },
                  { case: { $lt: ["$age", 50] }, then: "40-49" },
                  { case: { $lt: ["$age", 60] }, then: "50-59" },
                  { case: { $gte: ["$age", 60] }, then: "60+" },
                ],
                default: "Unknown",
              },
            },
            count: { $sum: 1 },
          },
        },
      ]);

      return { ncdTypes: stats, ageGroups };
    } catch (error) {
      throw new Error(`Error getting NCD stats: ${error}`);
    }
  }
}
