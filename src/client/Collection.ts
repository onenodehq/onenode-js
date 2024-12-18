import { EmbText } from "../models/embText";

class APIClientError extends Error {
  constructor(public statusCode: number, public message: string) {
    super(message);
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

  private transformEmbText(document: any): any {
    if (document && typeof document === "object") {
      for (const key in document) {
        if (document[key] instanceof EmbText) {
          document[key] = document[key].toJSON();
        } else if (typeof document[key] === "object") {
          this.transformEmbText(document[key]);
        }
      }
    }
    return document;
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

    if (code === 401) {
      throw new AuthenticationError(code, message);
    } else if (code >= 400 && code < 500) {
      throw new ClientRequestError(code, message);
    } else {
      throw new ServerError(code, message);
    }
  }

  public async insert(documents: object[]): Promise<object> {
    const url = this.getCollectionUrl();
    const headers = this.getHeaders();
    const transformedDocuments = documents.map((doc) =>
      this.transformEmbText(doc)
    );
    const data = { documents: transformedDocuments };

    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(data),
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
    const transformedUpdate = this.transformEmbText(update);
    const data = { filter, update: transformedUpdate, upsert };

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
    const data = { filter };

    const response = await fetch(url, {
      method: "DELETE",
      headers,
      body: JSON.stringify(data),
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
    const data = { filter, projection, sort, limit, skip };

    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(data),
    });
    return this.handleResponse(response);
  }

  public async query(
    query: string,
    embModel: string,
    topK: number,
    includeValues: boolean = false,
    projection?: { mode: string; fields: string[] }
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
