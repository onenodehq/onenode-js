import { Database } from "./Database";

export class CapyDB {
  private projectId: string;
  private apiKey: string;

  constructor() {
    this.projectId = process.env.CAPYDB_PROJECT_ID || "";
    this.apiKey = process.env.CAPYDB_API_KEY || "";

    if (!this.projectId) {
      throw new Error(
        "Project ID must be specified either as an argument or in the environment variable CAPYDB_PROJECT_ID."
      );
    }

    if (!this.apiKey) {
      throw new Error(
        "API Key must be specified either as an argument or in the environment variable CAPYDB_API_KEY."
      );
    }
  }

  public db(dbName: string): Database {
    return new Database(this.apiKey, this.projectId, dbName);
  }
}
