import { Database } from "./Database";

export class OneNode {
  private projectId: string;

  constructor(projectId: string) {
    this.projectId = projectId;
  }

  /**
   * Get a database instance.
   * @param dbName - The name of the database
   */
  public db(dbName: string): Database {
    return new Database(this.projectId, dbName);
  }
}
