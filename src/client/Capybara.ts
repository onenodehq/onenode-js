import { Database } from "./Database";

export class CapybaraDB {
  private projectId: string;
  private apiKey: string;

  constructor() {
    // Ensure that environment variables are checked and valid
    this.projectId = process.env.CAPYBARA_PROJECT_ID || "";
    this.apiKey = process.env.CAPYBARA_API_KEY || "";

    // Validate that both values are provided
    if (!this.projectId) {
      throw new Error(
        "Project ID must be specified either as an argument or in the environment variable CAPYBARA_PROJECT_ID."
      );
    }

    if (!this.apiKey) {
      throw new Error(
        "API Key must be specified either as an argument or in the environment variable CAPYBARA_API_KEY."
      );
    }
  }

  /**
   * Get a database instance.
   * @param dbName - The name of the database
   */
  public db(dbName: string): Database {
    return new Database(this.apiKey, this.projectId, dbName);
  }
}
