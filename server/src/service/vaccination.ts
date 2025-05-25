import { Vaccination } from "../models/Vaccination";
import { IVaccination } from "../types";
import { BaseService } from "./BaseService";

export class VaccinationService extends BaseService<IVaccination> {
  protected model = Vaccination;
  private static instance: VaccinationService;

  private constructor() {
    super();
  }

  public static getInstance(): VaccinationService {
    if (!VaccinationService.instance) {
      VaccinationService.instance = new VaccinationService();
    }
    return VaccinationService.instance;
  }

  public async findByBabyId(babyId: string): Promise<IVaccination[]> {
    try {
      return await Vaccination.find({ babyId })
        .populate("babyId", "firstName lastName dateOfBirth")
        .populate("administeredBy", "firstName lastName facilityName")
        .sort({ dateAdministered: -1 });
    } catch (error) {
      throw new Error(`Error finding vaccinations: ${error}`);
    }
  }

  public async getUpcomingVaccinations(days: number = 30): Promise<IVaccination[]> {
    try {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + days);

      return await Vaccination.find({
        nextDueDate: { $lte: futureDate, $gte: new Date() },
      })
        .populate("babyId", "firstName lastName dateOfBirth")
        .populate("administeredBy", "firstName lastName facilityName");
    } catch (error) {
      throw new Error(`Error finding upcoming vaccinations: ${error}`);
    }
  }

  public async getVaccinationStats(): Promise<any> {
    try {
      const stats = await Vaccination.aggregate([
        {
          $group: {
            _id: "$vaccineType",
            count: { $sum: 1 },
            lastAdministered: { $max: "$dateAdministered" },
          },
        },
        { $sort: { count: -1 } },
      ]);

      return stats;
    } catch (error) {
      throw new Error(`Error getting vaccination stats: ${error}`);
    }
  }
}
