import { Collection } from "./Collection";

/**
 * Database - Represents a database in CapybaraDB
 * 
 * The Database class provides access to collections within a specific database in your CapybaraDB project.
 * It serves as an intermediate layer between the CapybaraDB client and collections.
 * 
 * In CapybaraDB, a database is a logical container for collections, similar to databases in other NoSQL systems.
 * 
 * Usage:
 * ```typescript
 * import { CapybaraDB } from "capybaradb";
 * 
 * const client = new CapybaraDB();
 * 
 * // Get a database instance
 * const db = client.db("my_database");
 * 
 * // Access a collection within the database
 * const collection = db.collection("my_collection");
 * ```
 */
export class Database {
  /**
   * API key for authentication with CapybaraDB
   */
  private apiKey: string;
  
  /**
   * Project ID that identifies your CapybaraDB project
   */
  private projectId: string;
  
  /**
   * Name of the database
   */
  private dbName: string;

  /**
   * Creates a new Database instance.
   * 
   * Note: You typically don't need to create this directly.
   * Instead, use the `db()` method on a CapybaraDB client instance.
   * 
   * @param apiKey - API key for authentication
   * @param projectId - Project ID that identifies your CapybaraDB project
   * @param dbName - Name of the database to access
   */
  constructor(apiKey: string, projectId: string, dbName: string) {
    this.apiKey = apiKey;
    this.projectId = projectId;
    this.dbName = dbName;
  }

  /**
   * Get a collection instance within this database.
   * 
   * This method provides access to a specific collection within the database.
   * Collections in CapybaraDB are similar to collections in MongoDB or tables in SQL databases.
   * They store documents (JSON objects) that can contain embedded text fields for semantic search.
   * 
   * @param collectionName - The name of the collection to access
   * @returns A Collection instance for the specified collection
   * 
   * @example
   * ```typescript
   * const collection = db.collection("my_collection");
   * 
   * // Insert documents
   * await collection.insert([{ name: "Document 1" }]);
   * 
   * // Query documents
   * const results = await collection.find({ name: "Document 1" });
   * ```
   */
  public collection(collectionName: string): Collection {
    return new Collection(
      this.apiKey,
      this.projectId,
      this.dbName,
      collectionName
    );
  }
}
