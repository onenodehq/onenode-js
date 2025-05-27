import { Database } from "./Database";

export class OneNode {
  private projectId: string;
  private apiKey: string;

  constructor() {
    this.projectId = process.env.ONENODE_PROJECT_ID || "";
    this.apiKey = process.env.ONENODE_API_KEY || "";

    if (!this.projectId) {
      throw new Error(
        "Project ID must be specified either as an argument or in the environment variable ONENODE_PROJECT_ID."
      );
    }

    if (!this.apiKey) {
      throw new Error(
        "API Key must be specified either as an argument or in the environment variable ONENODE_API_KEY."
      );
    }
  }

  public db(dbName: string): Database {
    return new Database(this.apiKey, this.projectId, dbName);
  }
}
