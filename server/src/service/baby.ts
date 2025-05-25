import { Baby } from "../models/Baby";
import { IBaby } from "../types";
import { BaseService } from "./BaseService";

export class BabyService extends BaseService<IBaby> {
  protected model = Baby;
  private static instance: BabyService;

  private constructor() {
    super();
  }

  public static getInstance(): BabyService {
    if (!BabyService.instance) {
      BabyService.instance = new BabyService();
    }
    return BabyService.instance;
  }

  public async findByParentId(parentId: string): Promise<IBaby[]> {
    try {
      return await Baby.find({ parentId }).populate("parentId", "firstName lastName email");
    } catch (error) {
      throw new Error(`Error finding babies: ${error}`);
    }
  }

  public async searchBabies(query: string, limit?: number): Promise<IBaby[]> {
    try {
      const searchRegex = new RegExp(query, "i");
      let searchQuery = Baby.find({
        $or: [{ firstName: searchRegex }, { lastName: searchRegex }],
      }).populate("parentId", "firstName lastName email");

      if (limit) {
        searchQuery = searchQuery.limit(limit);
      }

      return await searchQuery.exec();
    } catch (error) {
      throw new Error(`Error searching babies: ${error}`);
    }
  }
}
