import { Database } from "./Database";

/**
 * CapybaraDB - Main client class for interacting with CapybaraDB
 * 
 * This is the entry point for the CapybaraDB JavaScript SDK. It provides access to databases
 * and collections within the CapybaraDB service.
 * 
 * CapybaraDB is an AI-native database that combines NoSQL, vector storage, and object storage
 * in a single platform. It allows you to store documents with embedded text fields that are
 * automatically processed for semantic search.
 * 
 * Usage:
 * ```typescript
 * import { CapybaraDB, EmbText } from "capybaradb";
 * import dotenv from "dotenv";
 * 
 * // Load environment variables (recommended for development)
 * dotenv.config();
 * 
 * // Initialize the client (requires CAPYBARA_PROJECT_ID and CAPYBARA_API_KEY env variables)
 * const client = new CapybaraDB();
 * 
 * // Access a database and collection
 * const db = client.db("my_database");
 * const collection = db.collection("my_collection");
 * 
 * // Insert a document with an EmbText field (no manual embedding required)
 * const doc = {
 *   title: "Sample Document",
 *   content: new EmbText("This is sample text that will be automatically embedded.")
 * };
 * await collection.insert([doc]);
 * 
 * // Perform semantic search
 * const results = await collection.query("sample text");
 * ```
 * 
 * Authentication:
 * The SDK requires two environment variables:
 * - CAPYBARA_PROJECT_ID: Your project ID from the CapybaraDB console
 * - CAPYBARA_API_KEY: Your API key from the CapybaraDB console
 * 
 * For production, these should be securely stored in your environment.
 */
export class CapybaraDB {
  private projectId: string;
  private apiKey: string;

  /**
   * Creates a new CapybaraDB client instance.
   * 
   * Automatically reads the project ID and API key from environment variables:
   * - CAPYBARA_PROJECT_ID: Your project ID from the CapybaraDB console
   * - CAPYBARA_API_KEY: Your API key from the CapybaraDB console
   * 
   * @throws Error if either the project ID or API key is missing
   */
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
   * 
   * This method provides access to a specific database within your CapybaraDB project.
   * From the database, you can access collections and perform operations on documents.
   * 
   * @param dbName - The name of the database to access
   * @returns A Database instance for the specified database
   * 
   * @example
   * ```typescript
   * const db = client.db("my_database");
   * ```
   */
  public db(dbName: string): Database {
    return new Database(this.apiKey, this.projectId, dbName);
  }
}
