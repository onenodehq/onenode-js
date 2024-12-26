import { EmbText } from "../embJson/embText";

const BSON_SERIALIZERS: Record<string, (v: any) => any> = {
  EmbText: (v: EmbText) => ({ "@embText": v.toJSON() }),
  ObjectId: (v: any) => ({ $oid: v.toString() }),
  Date: (v: Date) => ({ $date: v.toISOString() }),
  Decimal128: (v: any) => ({ $numberDecimal: v.toString() }),
  Binary: (v: any) => ({ $binary: v.toString("hex") }),
  RegExp: (v: RegExp) => ({ $regex: v.source, $options: v.flags }),
  Code: (v: any) => ({ $code: v.toString() }),
  Timestamp: (v: any) => ({ $timestamp: { t: v.t, i: v.i } }),
  MinKey: () => ({ $minKey: 1 }),
  MaxKey: () => ({ $maxKey: 1 }),
};

class APIClientError extends Error {
  public statusCode: number;
  public message: string;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
    this.message = message;
    this.name = "APIClientError";
  }
}

class AuthenticationError extends APIClientError {
  constructor(statusCode: number, message: string) {
    super(statusCode, message);
    this.name = "AuthenticationError";
  }
}

class ClientRequestError extends APIClientError {
  constructor(statusCode: number, message: string) {
    super(statusCode, message);
    this.name = "ClientRequestError";
  }
}

class ServerError extends APIClientError {
  constructor(statusCode: number, message: string) {
    super(statusCode, message);
    this.name = "ServerError";
  }
}

export class Collection {
  private apiKey: string;
  private projectId: string;
  private dbName: string;
  private collectionName: string;

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
    return `https://api.capybaradb.co/v0/db/${this.projectId}_${this.dbName}/collection/${this.collectionName}/document`;
  }

  private getHeaders(): HeadersInit {
    return {
      Authorization: `Bearer ${this.apiKey}`,
      "Content-Type": "application/json",
    };
  }

  private serialize(value: any): any {
    if (
      value === null ||
      ["string", "number", "boolean"].includes(typeof value)
    ) {
      return value;
    }
    if (Array.isArray(value)) {
      return value.map(this.serialize.bind(this));
    }
    if (value instanceof EmbText) {
      return BSON_SERIALIZERS.EmbText(value);
    }
    const serializer = BSON_SERIALIZERS[value.constructor?.name];
    if (serializer) {
      return serializer(value);
    }
    if (typeof value === "object") {
      const serializedObj: Record<string, any> = {};
      for (const key in value) {
        serializedObj[key] = this.serialize(value[key]);
      }
      return serializedObj;
    }
    throw new TypeError(`Unsupported BSON type: ${typeof value}`);
  }

  private async handleResponse(response: Response): Promise<any> {
    if (response.ok) {
      return response.json();
    }
    let errorData: any;
    try {
      errorData = await response.json();
    } catch {
      throw new APIClientError(response.status, response.statusText);
    }
    const { code = response.status, message = "An unknown error occurred." } =
      errorData;
    if (code === 401) throw new AuthenticationError(code, message);
    if (code >= 400 && code < 500) throw new ClientRequestError(code, message);
    throw new ServerError(code, message);
  }

  public async insert(documents: object[]): Promise<object> {
    const url = this.getCollectionUrl();
    const headers = this.getHeaders();
    const serializedDocs = documents.map(this.serialize.bind(this));
    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify({ documents: serializedDocs }),
    });
    return this.handleResponse(response);
  }

  public async update(
    filter: object,
    update: object,
    upsert: boolean = false
  ): Promise<object> {
    const url = this.getCollectionUrl();
    const headers = this.getHeaders();
    const data = {
      filter: this.serialize(filter),
      update: this.serialize(update),
      upsert,
    };
    const response = await fetch(url, {
      method: "PUT",
      headers,
      body: JSON.stringify(data),
    });
    return this.handleResponse(response);
  }

  public async delete(filter: object): Promise<object> {
    const url = this.getCollectionUrl();
    const headers = this.getHeaders();
    const response = await fetch(url, {
      method: "DELETE",
      headers,
      body: JSON.stringify({ filter: this.serialize(filter) }),
    });
    return this.handleResponse(response);
  }

  public async find(
    filter: object,
    projection?: object,
    sort?: object,
    limit?: number,
    skip?: number
  ): Promise<object[]> {
    const url = `${this.getCollectionUrl()}/find`;
    const headers = this.getHeaders();
    const data = {
      filter: this.serialize(filter),
      projection,
      sort,
      limit,
      skip,
    };
    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(data),
    });
    return this.handleResponse(response);
  }

  public async query(
    query: string,
    embModel?: string,
    topK?: number,
    includeValues?: boolean,
    projection?: object
  ): Promise<object[]> {
    const url = `${this.getCollectionUrl()}/query`;
    const headers = this.getHeaders();
    const data = {
      query,
      emb_model: embModel,
      top_k: topK,
      include_values: includeValues,
      projection,
    };
    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(data),
    });
    return this.handleResponse(response);
  }
}
