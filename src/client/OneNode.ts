import { Database } from "./Database";
import { ObjectId } from "bson";

export class OneNode {
  private projectId: string;
  private apiKey: string;
  private isAnonymous: boolean;

  // Helper method to check if we're in Node.js environment
  private static isNodeEnvironment(): boolean {
    return typeof process !== 'undefined' && process.versions && !!process.versions.node;
  }

  constructor() {
    // Check if we're in a browser environment and throw an error
    if (!OneNode.isNodeEnvironment()) {
      throw new Error(
        "OneNode client can only be initialized in Node.js server-side environments. " +
        "It requires access to environment variables and file system operations that are not available in browsers. " +
        "Please use this client in your backend/server code only."
      );
    }

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
          "Missing Project ID: Please provide the Project ID as an argument or set it in the ONENODE_PROJECT_ID environment variable. " +
          "Tip: Ensure your environment file (e.g., .env) is loaded."
        );
      }
    }

  }

  private getOrCreateAnonymousProjectId(): string {
    const anonFilePath = ".onenode";
    const fs = require('fs'); // Dynamic import since we know we're in Node.js at this point

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
