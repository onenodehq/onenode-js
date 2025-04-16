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
import { EmbImage } from "../embJson/embImage";

type SerializerFunction = (v: any) => Record<string, any>;

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

  private getCollectionUrl(): string {
    return `https://api.capydb.co/v0/db/${this.projectId}_${this.dbName}/collection/${this.collectionName}/document`;
  }

  private getHeaders(): HeadersInit {
    return {
      Authorization: `Bearer ${this.apiKey}`,
      "Content-Type": "application/json",
    };
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

    if (value instanceof EmbText) {
      return value.toJSON();
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

    if ("@embText" in obj) {
      return EmbText.fromJSON(obj);
    }
    
    if ("@embImage" in obj) {
      return EmbImage.fromJSON(obj);
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

    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify({ documents: serializedDocs }),
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

  public async find<TDocument = Record<string, any>>(
    filter: unknown,
    projection?: unknown,
    sort?: unknown,
    limit?: number,
    skip?: number
  ): Promise<TDocument[]> {
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
    const url = `${this.getCollectionUrl()}/query`;
    const headers = this.getHeaders();

    const data: Record<string, unknown> = { query };

    if (options?.filter != null) {
      data["filter"] = this.serialize(options.filter);
    }
    if (options?.projection != null) {
      data["projection"] = options.projection;
    }
    if (options?.embModel != null) {
      data["emb_model"] = options.embModel;
    }
    if (options?.topK != null) {
      data["top_k"] = options.topK;
    }
    if (options?.includeValues != null) {
      data["include_values"] = options.includeValues;
    }

    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(data),
    });

    const responseData = await this.handleResponse(response) as Record<string, unknown>;
    return (responseData.matches || []) as TQueryResult[];
  }
}
