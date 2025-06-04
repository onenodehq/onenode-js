import { Database } from "./Database";
import { ObjectId } from "bson";
import * as fs from "fs";

export class OneNode {
  private projectId: string;
  private apiKey: string;
  private isAnonymous: boolean;

  constructor() {
    this.projectId = process.env.ONENODE_PROJECT_ID || "";
    this.apiKey = process.env.ONENODE_API_KEY || "";
    this.isAnonymous = false;

    // If no API key provided, enter anonymous mode
    if (!this.apiKey) {
      this.isAnonymous = true;
      // Generate or load anonymous project ID
      this.projectId = this.getOrCreateAnonymousProjectId();
    } else {
      // Authenticated mode - require project ID
      if (!this.projectId) {
        throw new Error(
          "Project ID must be specified either as an argument or in the environment variable ONENODE_PROJECT_ID."
        );
      }
    }
  }

  private getOrCreateAnonymousProjectId(): string {
    const anonFilePath = ".onenode";

    // Try to load existing project ID
    if (fs.existsSync(anonFilePath)) {
      try {
        const projectId = fs.readFileSync(anonFilePath, 'utf8').trim();
        // Validate that it's a valid ObjectId format
        new ObjectId(projectId);
        return projectId;
      } catch (error) {
        // File exists but is invalid, will create new one
      }
    }

    // Generate new project ID
    const newProjectId = new ObjectId().toString();

    // Save to file
    try {
      fs.writeFileSync(anonFilePath, newProjectId);
    } catch (error) {
      // If we can't write the file, just use the generated ID without persistence
    }

    return newProjectId;
  }

  public db(dbName: string): Database {
    return new Database(this.apiKey, this.projectId, dbName, this.isAnonymous);
  }
}
