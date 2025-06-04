import { Collection } from "./Collection";

export class Database {
  private apiKey: string;
  private projectId: string;
  private dbName: string;
  private isAnonymous: boolean;

  constructor(apiKey: string, projectId: string, dbName: string, isAnonymous: boolean = false) {
    this.apiKey = apiKey;
    this.projectId = projectId;
    this.dbName = dbName;
    this.isAnonymous = isAnonymous;
  }

  public collection(collectionName: string): Collection {
    return new Collection(
      this.apiKey,
      this.projectId,
      this.dbName,
      collectionName,
      this.isAnonymous
    );
  }
}
