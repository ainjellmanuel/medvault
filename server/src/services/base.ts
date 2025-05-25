export abstract class BaseService<T> {
  protected abstract model: any;

  public async create(data: Partial<T>): Promise<T> {
    try {
      const document = new this.model(data);
      return await document.save();
    } catch (error) {
      throw new Error(`Error creating document: ${error}`);
    }
  }

  public async findById(id: string): Promise<T | null> {
    try {
      return await this.model.findById(id);
    } catch (error) {
      throw new Error(`Error finding document: ${error}`);
    }
  }

  public async findAll(filter: any = {}, limit?: number, skip?: number): Promise<T[]> {
    try {
      let query = this.model.find(filter);
      if (skip) query = query.skip(skip);
      if (limit) query = query.limit(limit);
      return await query.exec();
    } catch (error) {
      throw new Error(`Error finding documents: ${error}`);
    }
  }

  public async update(id: string, data: Partial<T>): Promise<T | null> {
    try {
      return await this.model.findByIdAndUpdate(id, data, { new: true });
    } catch (error) {
      throw new Error(`Error updating document: ${error}`);
    }
  }

  public async delete(id: string): Promise<boolean> {
    try {
      const result = await this.model.findByIdAndDelete(id);
      return !!result;
    } catch (error) {
      throw new Error(`Error deleting document: ${error}`);
    }
  }

  public async count(filter: any = {}): Promise<number> {
    try {
      return await this.model.countDocuments(filter);
    } catch (error) {
      throw new Error(`Error counting documents: ${error}`);
    }
  }
}
