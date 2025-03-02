/**
 * CapybaraDB JavaScript SDK
 * 
 * The official JavaScript/TypeScript library for CapybaraDB - an AI-native database that combines
 * NoSQL, vector storage, and object storage in a single platform.
 * 
 * This package provides a simple, intuitive interface for:
 * - Storing documents with embedded text fields (no manual embedding required)
 * - Performing semantic searches on your data
 * - Managing collections and databases
 * 
 * Key components:
 * - CapybaraDB: Main client class for connecting to the service
 * - Database: Class for accessing and managing databases
 * - Collection: Class for accessing and managing collections
 * - EmbText: Special data type for text that will be automatically embedded
 * - EmbImage: Special data type for images that can be processed by vision models
 * - EmbModels: Constants for supported embedding models
 * - VisionModels: Constants for supported vision models
 * 
 * Important Note:
 * CapybaraDB processes embeddings asynchronously on the server side. When you insert documents
 * with EmbText or EmbImage fields, there will be a short delay (typically a few seconds) before
 * these documents become available for semantic search. This is because the embedding generation
 * happens in the background after the document is stored.
 * 
 * Basic usage:
 * ```typescript
 * import { CapybaraDB, EmbText } from "capybaradb";
 * import dotenv from "dotenv";
 * 
 * // Load environment variables (CAPYBARA_API_KEY and CAPYBARA_PROJECT_ID)
 * dotenv.config();
 * 
 * // Initialize the client
 * const client = new CapybaraDB();
 * 
 * // Access a database and collection
 * const collection = client.db("my_database").collection("my_collection");
 * 
 * // Insert a document with embedded text
 * const doc = {
 *   title: "Sample Document",
 *   category: "AI",
 *   published: true,
 *   content: new EmbText("This text will be automatically embedded for semantic search")
 * };
 * await collection.insert([doc]);
 * 
 * // Note: There will be a short delay before the document is available for semantic search
 * // as embeddings are processed asynchronously on the server side
 * 
 * // Perform semantic search (after embeddings have been processed)
 * const results = await collection.query("semantic search");
 * 
 * // Perform semantic search with filter
 * const filteredResults = await collection.query("semantic search", {
 *   filter: { category: "AI", published: true },
 *   topK: 5
 * });
 * ```
 * 
 * For more information, see the documentation at https://capybaradb.co/docs
 */

// Main client classes
export { CapybaraDB } from "./client/Capybara";
export { Database } from "./client/Database";
export { Collection } from "./client/Collection";

// Special data types for AI-native features
export { EmbText } from "./embJson/embText";
export { EmbImage } from "./embJson/embImage";
export { EmbModels } from "./embJson/embModels";
export { VisionModels } from "./embJson/visionModels";

// Re-export BSON types for convenience
export {
  ObjectId,
  Binary,
  Code,
  DBRef,
  Decimal128,
  Double,
  Int32,
  Long,
  MaxKey,
  MinKey,
  BSONSymbol,
  Timestamp,
  UUID,
  BSONRegExp,
  BSONError,
  BSONType,
} from "bson";
