import { serializeDocument } from '../utils/serializeDocument';

export class BaseRepository<T> {
  private database: any;
  private collectionName: string;

  constructor(database: any, collectionName: string) {
    this.database = database;
    this.collectionName = collectionName;
  }

  public async insertMany(documents: T[]): Promise<any> {
    const serializedDocuments = documents.map(serializeDocument);

    try {
      const result = await this.database.collection(this.collectionName).insertMany(serializedDocuments);
      return result;
    } catch (error) {
      console.error(`Failed to insert documents into ${this.collectionName}:`, error);
      throw new Error('Error inserting documents.');
    }
  }
}
