import {
  Binary,
  Code,
  Decimal128,
  MaxKey,
  MinKey,
  ObjectId,
  Timestamp,
} from "bson";
import { Text } from "../ejson/text";
import { Image } from "../ejson/image";

type SerializerFunction = (v: any) => Record<string, any>;

const BSON_SERIALIZERS: Record<string, SerializerFunction> = {
  Text: (v: Text) => v.serialize(),
  Image: (v: Image) => v.serialize(),
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

class AuthenticationError extends APIClientError {
  constructor(statusCode: number, message: string) {
    super(statusCode, message);
    this.name = "AuthenticationError";
    Object.setPrototypeOf(this, AuthenticationError.prototype);
  }
}

class ClientRequestError extends APIClientError {
  constructor(statusCode: number, message: string) {
    super(statusCode, message);
    this.name = "ClientRequestError";
    Object.setPrototypeOf(this, ClientRequestError.prototype);
  }
}

class ServerError extends APIClientError {
  constructor(statusCode: number, message: string) {
    super(statusCode, message);
    this.name = "ServerError";
    Object.setPrototypeOf(this, ServerError.prototype);
  }
}


export class Collection {
  private readonly apiKey: string;
  private readonly projectId: string;
  private readonly dbName: string;
  private readonly collectionName: string;
  private readonly isAnonymous: boolean;
  
  constructor(
    apiKey: string,
    projectId: string,
    dbName: string,
    collectionName: string,
    isAnonymous: boolean = false
  ) {
    this.apiKey = apiKey;
    this.projectId = projectId;
    this.dbName = dbName;
    this.collectionName = collectionName;
    this.isAnonymous = isAnonymous;
  }

  private getCollectionUrl(): string {
    return `https://api.onenode.ai/v0/db/${this.projectId}_${this.dbName}/collection/${this.collectionName}`;
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {};
    if (!this.isAnonymous) {
      headers.Authorization = `Bearer ${this.apiKey}`;
    }
    return headers;
  }

  private serialize(value: unknown, depth = 0): unknown {
    if (depth > 100) {
      throw new Error("Too much nesting or circular structure in serialize()");
    }

    if (
      value === null ||
      typeof value === "undefined" ||
      typeof value === "boolean" ||
      typeof value === "number" ||
      typeof value === "string"
    ) {
      return value;
    }

    if (Array.isArray(value)) {
      return value.map((item) => this.serialize(item, depth + 1));
    }

    if (value instanceof Text) {
      return value.serialize();
    }

    if (value instanceof Image) {
      return value.serialize();
    }

    const constructor = (value as object).constructor;
    const serializer = BSON_SERIALIZERS[constructor.name];
    if (serializer) {
      return serializer(value);
    }

    if (typeof value === "object") {
      const result: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(value)) {
        result[key] = this.serialize(val, depth + 1);
      }
      return result;
    }

    throw new TypeError(`Unsupported BSON type: ${typeof value}`);
  }
  
  private deserialize(value: unknown, depth = 0): unknown {
    if (depth > 100) {
      throw new Error(
        "Too much nesting or circular structure in deserialize()"
      );
    }

    if (
      value === null ||
      typeof value === "undefined" ||
      typeof value === "boolean" ||
      typeof value === "number" ||
      typeof value === "string"
    ) {
      return value;
    }

    if (Array.isArray(value)) {
      return value.map((item) => this.deserialize(item, depth + 1));
    }

    const obj = value as Record<string, any>;

    if ("xText" in obj) {
      return Text._deserialize(obj);
    }
    
    if ("xImage" in obj) {
      return Image._deserialize(obj);
    }

    if ("$oid" in obj) return new ObjectId(obj["$oid"]);
    if ("$date" in obj) return new Date(obj["$date"]);
    if ("$numberDecimal" in obj) return new Decimal128(obj["$numberDecimal"]);
    if ("$binary" in obj) return new Binary(Buffer.from(obj["$binary"], "hex"));
    if ("$regex" in obj) {
      return new RegExp(obj["$regex"], obj["$options"] ?? "");
    }
    if ("$code" in obj) return new Code(obj["$code"]);
    if ("$timestamp" in obj) {
      return Timestamp.fromBits(obj["$timestamp"].t, obj["$timestamp"].i);
    }
    if ("$minKey" in obj) return new MinKey();
    if ("$maxKey" in obj) return new MaxKey();

    const nested: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(obj)) {
      nested[key] = this.deserialize(val, depth + 1);
    }
    return nested;
  }

  private async extractBinaryData(documents: unknown[]): Promise<Record<string, Blob>> {
    const files: Record<string, Blob> = {};

    const extractFromValue = async (value: unknown, docIndex: number, path: string = ""): Promise<void> => {
      if (value instanceof Image && value.hasBinaryData()) {
        // Create field name following the pattern: doc_{index}.{field_path}.xImage.data
        const fieldName = path ? `doc_${docIndex}.${path}.xImage.data` : `doc_${docIndex}.xImage.data`;
        const binaryData = value.getBinaryData();
        if (binaryData) {
          // Convert to Blob if needed
          let blob: Blob | null = null;
          if (binaryData instanceof Blob) {
            blob = binaryData;
          } else if (binaryData instanceof File) {
            blob = binaryData;
          } else if (binaryData instanceof ArrayBuffer) {
            blob = new Blob([binaryData]);
          } else if (binaryData instanceof Uint8Array) {
            blob = new Blob([binaryData]);
          }
          
          if (blob) {
            files[fieldName] = blob;
          }
        }
      } else if (Array.isArray(value)) {
        for (let i = 0; i < value.length; i++) {
          const newPath = path ? `${path}.${i}` : `${i}`;
          await extractFromValue(value[i], docIndex, newPath);
        }
      } else if (value && typeof value === "object") {
        for (const [key, val] of Object.entries(value)) {
          const newPath = path ? `${path}.${key}` : key;
          await extractFromValue(val, docIndex, newPath);
        }
      }
    };

    for (let docIndex = 0; docIndex < documents.length; docIndex++) {
      await extractFromValue(documents[docIndex], docIndex);
    }

    return files;
  }

  private async handleResponse(response: Response): Promise<unknown> {
    try {
      if (!response.ok) {
        const errorData = await response.json();
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

      const jsonResponse = await response.json();
      return this.deserialize(jsonResponse);
    } catch (error) {
      if (error instanceof APIClientError) {
        throw error;
      }
      throw new APIClientError(response.status, response.statusText);
    }
  }

  public async insert(documents: unknown[]): Promise<unknown> {
    const url = this.getCollectionUrl();
    const headers = this.getHeaders();
    const serializedDocs = documents.map((doc) => this.serialize(doc));

    // Extract binary data for multipart form
    const binaryFiles = await this.extractBinaryData(documents);

    const formData = new FormData();
    formData.append('documents', JSON.stringify(serializedDocs));

    // Add binary files to form data
    for (const [fieldName, blob] of Object.entries(binaryFiles)) {
      formData.append(fieldName, blob, fieldName);
    }

    const response = await fetch(url, {
      method: "POST",
      headers,
      body: formData,
    });

    return this.handleResponse(response);
  }

  public async update(
    filter: unknown,
    update: unknown,
    upsert = false
  ): Promise<unknown> {
    const url = this.getCollectionUrl();
    const headers = this.getHeaders();
    
    // Extract binary data for multipart form (from update data)
    const binaryFiles = await this.extractBinaryData([update]);
    
    const formData = new FormData();
    formData.append('filter', JSON.stringify(this.serialize(filter)));
    formData.append('update', JSON.stringify(this.serialize(update)));
    formData.append('upsert', String(upsert));

    // Add binary files to form data
    for (const [fieldName, blob] of Object.entries(binaryFiles)) {
      formData.append(fieldName, blob, fieldName);
    }

    const response = await fetch(url, {
      method: "PUT",
      headers,
      body: formData,
    });

    return this.handleResponse(response);
  }

  public async delete(filter: unknown): Promise<unknown> {
    const url = this.getCollectionUrl();
    const headers = this.getHeaders();
    
    const formData = new FormData();
    formData.append('filter', JSON.stringify(this.serialize(filter)));

    const response = await fetch(url, {
      method: "DELETE",
      headers,
      body: formData,
    });

    return this.handleResponse(response);
  }

  public async find<TDocument = Record<string, any>>(
    filter: unknown,
    projection?: unknown,
    sort?: unknown,
    limit?: number,
    skip?: number
  ): Promise<TDocument[]> {
    let url = `${this.getCollectionUrl()}/document/find`;
    if (this.isAnonymous) {
      url += "/anon";
    }
    const headers = this.getHeaders();
    
    const formData = new FormData();
    formData.append('filter', JSON.stringify(this.serialize(filter)));
    
    if (projection !== undefined) {
      formData.append('projection', JSON.stringify(projection));
    }
    
    if (sort !== undefined) {
      formData.append('sort', JSON.stringify(sort));
    }
    
    if (limit !== undefined) {
      formData.append('limit', String(limit));
    }
    
    if (skip !== undefined) {
      formData.append('skip', String(skip));
    }

    const response = await fetch(url, {
      method: "POST",
      headers,
      body: formData,
    });

    const responseData = await this.handleResponse(response) as Record<string, unknown>;
    return (responseData.docs || []) as TDocument[];
  }

  public async query<TQueryResult = Record<string, any>>(
    query: string,
    options?: {
      filter?: Record<string, unknown>;
      projection?: Record<string, unknown>;
      embModel?: string;
      topK?: number;
      includeValues?: boolean;
    }
  ): Promise<TQueryResult[]> {
    let url = `${this.getCollectionUrl()}/query`;
    if (this.isAnonymous) {
      url += "/anon";
    }
    const headers = this.getHeaders();

    const formData = new FormData();
    formData.append('query', query);

    if (options?.filter != null) {
      formData.append('filter', JSON.stringify(this.serialize(options.filter)));
    }
    if (options?.projection != null) {
      formData.append('projection', JSON.stringify(options.projection));
    }
    if (options?.embModel != null) {
      formData.append('emb_model', options.embModel);
    }
    if (options?.topK != null) {
      formData.append('top_k', String(options.topK));
    }
    if (options?.includeValues != null) {
      formData.append('include_values', String(options.includeValues));
    }

    const response = await fetch(url, {
      method: "POST",
      headers,
      body: formData,
    });

    const responseData = await this.handleResponse(response) as Record<string, unknown>;
    return (responseData.matches || []) as TQueryResult[];
  }

  public async drop(): Promise<void> {
    if (this.isAnonymous) {
      throw new ClientRequestError(403, "Collection deletion is not allowed in anonymous mode.");
    }
    
    const url = `https://api.onenode.ai/v0/db/${this.projectId}_${this.dbName}/collection/${this.collectionName}`;
    const headers = this.getHeaders();
    
    const formData = new FormData();
    
    const response = await fetch(url, {
      method: "DELETE",
      headers,
      body: formData
    });
    
    // 204 responses have no content, so we should just check status without parsing JSON
    if (response.status === 204) {
      return;
    }
    
    await this.handleResponse(response);
  }
}
