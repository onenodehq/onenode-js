import {
  Binary,
  Code,
  Decimal128,
  MaxKey,
  MinKey,
  ObjectId,
  Timestamp,
} from "bson";
import { EmbText } from "../embJson/embText";

/**
 * Common interface for a function that serializes a known BSON type into a JSON-friendly object.
 * Used for converting complex BSON types to formats that can be transmitted over HTTP.
 */
type SerializerFunction = (v: any) => Record<string, any>;

/**
 * Map specific BSON types (and EmbText) to their serialization logic.
 * 
 * This mapping enables automatic conversion of complex data types when sending data to CapybaraDB:
 * - EmbText: Special CapybaraDB type for text that will be automatically embedded
 * - ObjectId: MongoDB-style unique identifiers
 * - Date: JavaScript Date objects
 * - Decimal128: High-precision decimal numbers
 * - Binary: Binary data
 * - RegExp: Regular expressions
 * - Code: JavaScript code
 * - Timestamp: Precise timestamps
 * - MinKey/MaxKey: Special BSON types for comparison operations
 */
const BSON_SERIALIZERS: Record<string, SerializerFunction> = {
  EmbText: (v: EmbText) => ({ "@embText": v.toJSON() }),
  ObjectId: (v: ObjectId) => ({ $oid: v.toString() }),
  Date: (v: Date) => ({ $date: v.toISOString() }),
  Decimal128: (v: Decimal128) => ({ $numberDecimal: v.toString() }),
  Binary: (v: Binary) => ({ $binary: v.toString("hex") }),
  RegExp: (v: RegExp) => ({ $regex: v.source, $options: v.flags }),
  Code: (v: Code) => ({ $code: v.toString() }),
  Timestamp: (v: Timestamp) => ({
    $timestamp: { t: v.getHighBits(), i: v.getLowBits() },
  }),
  MinKey: () => ({ $minKey: 1 }),
  MaxKey: () => ({ $maxKey: 1 }),
};

/**
 * Base API client error class.
 * 
 * Provides a foundation for more specific error types with status codes and messages.
 * All API errors extend from this class.
 */
class APIClientError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly message: string
  ) {
    super(message);
    this.name = "APIClientError";
    Object.setPrototypeOf(this, APIClientError.prototype);
  }
}

/**
 * Error class for authentication issues.
 * 
 * Thrown when there are problems with API keys or authentication tokens.
 * Typically occurs with status code 401.
 */
class AuthenticationError extends APIClientError {
  constructor(statusCode: number, message: string) {
    super(statusCode, message);
    this.name = "AuthenticationError";
    Object.setPrototypeOf(this, AuthenticationError.prototype);
  }
}

/**
 * Error class for client-side issues (4xx).
 * 
 * Thrown for problems like invalid parameters, missing required fields,
 * or other client-side validation errors.
 */
class ClientRequestError extends APIClientError {
  constructor(statusCode: number, message: string) {
    super(statusCode, message);
    this.name = "ClientRequestError";
    Object.setPrototypeOf(this, ClientRequestError.prototype);
  }
}

/**
 * Error class for server-side issues (5xx).
 * 
 * Thrown when the CapybaraDB service encounters internal errors,
 * is unavailable, or otherwise cannot process a valid request.
 */
class ServerError extends APIClientError {
  constructor(statusCode: number, message: string) {
    super(statusCode, message);
    this.name = "ServerError";
    Object.setPrototypeOf(this, ServerError.prototype);
  }
}

/**
 * Collection - Represents a collection in CapybaraDB
 * 
 * The Collection class is the primary interface for performing operations on documents:
 * - insert: Add new documents to the collection
 * - update: Modify existing documents
 * - delete: Remove documents
 * - find: Retrieve documents based on filters
 * - query: Perform semantic searches on embedded text fields
 * 
 * Collections in CapybaraDB are similar to collections in MongoDB or tables in SQL databases.
 * They store documents (JSON objects) that can contain embedded text fields for semantic search.
 * 
 * This class handles:
 * 1. Serialization of complex data types (BSON, EmbText) for API transmission
 * 2. Deserialization of API responses back into appropriate JavaScript types
 * 3. Error handling with specific error types
 * 4. HTTP communication with the CapybaraDB API
 * 
 * Usage:
 * ```typescript
 * import { CapybaraDB, EmbText } from "capybaradb";
 * 
 * const client = new CapybaraDB();
 * const collection = client.db("my_database").collection("my_collection");
 * 
 * // Insert documents
 * await collection.insert([
 *   { 
 *     title: "Document with embedded text",
 *     content: new EmbText("This text will be automatically embedded for semantic search")
 *   }
 * ]);
 * 
 * // Find documents by exact match
 * const docs = await collection.find({ title: "Document with embedded text" });
 * 
 * // Perform semantic search
 * const results = await collection.query("embedded text search");
 * ```
 */
export class Collection {
  /**
   * API key for authentication with CapybaraDB
   */
  private readonly apiKey: string;
  
  /**
   * Project ID that identifies your CapybaraDB project
   */
  private readonly projectId: string;
  
  /**
   * Name of the database containing this collection
   */
  private readonly dbName: string;
  
  /**
   * Name of this collection
   */
  private readonly collectionName: string;

  /**
   * Creates a new Collection instance.
   * 
   * Note: You typically don't need to create this directly.
   * Instead, use the `collection()` method on a Database instance.
   * 
   * @param apiKey - API key for authentication
   * @param projectId - Project ID that identifies your CapybaraDB project
   * @param dbName - Name of the database containing this collection
   * @param collectionName - Name of this collection
   */
  constructor(
    apiKey: string,
    projectId: string,
    dbName: string,
    collectionName: string
  ) {
    this.apiKey = apiKey;
    this.projectId = projectId;
    this.dbName = dbName;
    this.collectionName = collectionName;
  }

  /**
   * Builds the base URL for accessing documents in this collection.
   */
  private getCollectionUrl(): string {
    return `https://api.capybaradb.co/v0/db/${this.projectId}_${this.dbName}/collection/${this.collectionName}/document`;
  }

  /**
   * Builds standard headers, including Authorization.
   */
  private getHeaders(): HeadersInit {
    return {
      Authorization: `Bearer ${this.apiKey}`,
      "Content-Type": "application/json",
    };
  }

  /**
   * Recursively serialize values into JSON-friendly objects,
   * handling BSON types and EmbText.
   */
  private serialize(value: unknown, depth = 0): unknown {
    // Prevent overly deep or circular structures
    if (depth > 100) {
      throw new Error("Too much nesting or circular structure in serialize()");
    }

    // Handle primitive or nullish values
    if (
      value === null ||
      typeof value === "undefined" ||
      typeof value === "boolean" ||
      typeof value === "number" ||
      typeof value === "string"
    ) {
      return value;
    }

    // Handle arrays
    if (Array.isArray(value)) {
      return value.map((item) => this.serialize(item, depth + 1));
    }

    // Handle EmbText explicitly
    if (value instanceof EmbText) {
      return value.toJSON();
    }

    // Handle known BSON types via constructor name
    const constructor = (value as object).constructor;
    const serializer = BSON_SERIALIZERS[constructor.name];
    if (serializer) {
      return serializer(value);
    }

    // Handle generic objects (potentially nested documents)
    if (typeof value === "object") {
      const result: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(value)) {
        result[key] = this.serialize(val, depth + 1);
      }
      return result;
    }

    // Fallback for anything not recognized
    throw new TypeError(`Unsupported BSON type: ${typeof value}`);
  }

  /**
   * Recursively deserialize JSON-compatible objects back into BSON types (or EmbText).
   */
  private deserialize(value: unknown, depth = 0): unknown {
    if (depth > 100) {
      throw new Error(
        "Too much nesting or circular structure in deserialize()"
      );
    }

    // Pass through primitives
    if (
      value === null ||
      typeof value === "undefined" ||
      typeof value === "boolean" ||
      typeof value === "number" ||
      typeof value === "string"
    ) {
      return value;
    }

    // Handle arrays
    if (Array.isArray(value)) {
      return value.map((item) => this.deserialize(item, depth + 1));
    }

    // Handle objects
    const obj = value as Record<string, any>;

    // EmbText
    if ("@embText" in obj) {
      return EmbText.fromJSON(obj["@embText"]);
    }

    // BSON markers
    if ("$oid" in obj) return new ObjectId(obj["$oid"]);
    if ("$date" in obj) return new Date(obj["$date"]);
    if ("$numberDecimal" in obj) return new Decimal128(obj["$numberDecimal"]);
    if ("$binary" in obj) return new Binary(Buffer.from(obj["$binary"], "hex"));
    if ("$regex" in obj) {
      // $options should be interpreted as flags
      return new RegExp(obj["$regex"], obj["$options"] ?? "");
    }
    if ("$code" in obj) return new Code(obj["$code"]);
    if ("$timestamp" in obj) {
      return Timestamp.fromBits(obj["$timestamp"].t, obj["$timestamp"].i);
    }
    if ("$minKey" in obj) return new MinKey();
    if ("$maxKey" in obj) return new MaxKey();

    // Nested object
    const nested: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(obj)) {
      nested[key] = this.deserialize(val, depth + 1);
    }
    return nested;
  }

  /**
   * Handle the HTTP response, raising typed errors for 4xx/5xx responses.
   */
  private async handleResponse(response: Response): Promise<unknown> {
    try {
      // Check for non-OK status
      if (!response.ok) {
        // Attempt to parse JSON error body
        const errorData = await response.json();
        // Extract code and message, or use defaults
        const code = errorData.code ?? response.status;
        const message = errorData.message ?? "An unknown error occurred.";

        if (code === 401) {
          throw new AuthenticationError(code, message);
        } else if (code >= 400 && code < 500) {
          throw new ClientRequestError(code, message);
        } else {
          throw new ServerError(code, message);
        }
      }

      // Parse JSON if successful
      const jsonResponse = await response.json();
      return this.deserialize(jsonResponse);
    } catch (error) {
      // If we already threw an APIClientError, just rethrow
      if (error instanceof APIClientError) {
        throw error;
      }
      // Otherwise, wrap unknown errors in a generic client error
      throw new APIClientError(response.status, response.statusText);
    }
  }

  /**
   * Insert one or more documents into the collection.
   * 
   * Note: When inserting documents with EmbText or EmbImage fields, there will be a short delay
   * (typically a few seconds) before these documents become available for semantic search.
   * This is because CapybaraDB processes embeddings asynchronously on the server side after
   * the document is stored.
   * 
   * @param documents - Array of documents to insert
   * @returns Promise resolving to the insertion result
   */
  public async insert(documents: unknown[]): Promise<unknown> {
    const url = this.getCollectionUrl();
    const headers = this.getHeaders();
    const serializedDocs = documents.map((doc) => this.serialize(doc));

    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify({ documents: serializedDocs }),
    });

    return this.handleResponse(response);
  }

  /**
   * Update documents matching a given filter with provided updates.
   * Optionally upsert if no matching documents are found.
   */
  public async update(
    filter: unknown,
    update: unknown,
    upsert = false
  ): Promise<unknown> {
    const url = this.getCollectionUrl();
    const headers = this.getHeaders();

    const response = await fetch(url, {
      method: "PUT",
      headers,
      body: JSON.stringify({
        filter: this.serialize(filter),
        update: this.serialize(update),
        upsert,
      }),
    });

    return this.handleResponse(response);
  }

  /**
   * Delete documents matching a filter.
   */
  public async delete(filter: unknown): Promise<unknown> {
    const url = this.getCollectionUrl();
    const headers = this.getHeaders();

    const response = await fetch(url, {
      method: "DELETE",
      headers,
      body: JSON.stringify({
        filter: this.serialize(filter),
      }),
    });

    return this.handleResponse(response);
  }

  /**
   * Find documents matching a filter, optionally applying projection, sort, limit, and skip.
   */
  public async find(
    filter: unknown,
    projection?: unknown,
    sort?: unknown,
    limit?: number,
    skip?: number
  ): Promise<unknown[]> {
    const url = `${this.getCollectionUrl()}/find`;
    const headers = this.getHeaders();

    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify({
        filter: this.serialize(filter),
        projection,
        sort,
        limit,
        skip,
      }),
    });

    return this.handleResponse(response) as Promise<unknown[]>;
  }

  /**
   * Query for documents using semantic search with optional embeddings, top_k, etc.
   */
  public async query(
    query: string, // Positional argument
    options?: {
      embModel?: string;
      topK?: number;
      includeValues?: boolean;
      projection?: Record<string, unknown>;
    }
  ): Promise<unknown[]> {
    const url = `${this.getCollectionUrl()}/query`;
    const headers = this.getHeaders();

    // Build the data object dynamically
    const data: Record<string, unknown> = { query };

    if (options?.embModel != null) {
      data["emb_model"] = options.embModel;
    }
    if (options?.topK != null) {
      data["top_k"] = options.topK;
    }
    if (options?.includeValues != null) {
      data["include_values"] = options.includeValues;
    }
    if (options?.projection != null) {
      data["projection"] = options.projection;
    }

    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(data),
    });

    return this.handleResponse(response) as Promise<unknown[]>;
  }
}
