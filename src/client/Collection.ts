import { EmbText } from "../models/embText";

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
    return `https://api.capybaradb.co/v1/db/${this.projectId}_${this.dbName}/collection/${this.collectionName}/document`;
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

  /**
   * Insert one document into the collection.
   * @param document - The document to insert
   */
  public async insertOne(document: object): Promise<object> {
    const url = this.getCollectionUrl();
    const headers = this.getHeaders();
    const transformedDocument = this.transformEmbText(document);
    const data = { documents: [transformedDocument] };

    try {
      const response = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`API call failed: ${response.statusText}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Error inserting document:", error);
      throw error;
    }
  }

  /**
   * Insert many documents into the collection.
   * @param documents - The documents to insert
   */
  public async insertMany(documents: object[]): Promise<object> {
    const url = this.getCollectionUrl();
    const headers = this.getHeaders();
    const transformedDocuments = documents.map((doc) =>
      this.transformEmbText(doc)
    );
    const data = { documents: transformedDocuments };

    try {
      const response = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`API call failed: ${response.statusText}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Error inserting documents:", error);
      throw error;
    }
  }

  /**
   * Update documents in the collection.
   * @param filter - The filter to match the documents to update
   * @param update - The update operations to apply
   * @param upsert - Optional upsert flag (default: false)
   */
  public async update(
    filter: object,
    update: object,
    upsert: boolean = false
  ): Promise<object> {
    const url = this.getCollectionUrl();
    const headers = this.getHeaders();
    const transformedUpdate = this.transformEmbText(update);
    const data = { filter, update: transformedUpdate, upsert };

    try {
      const response = await fetch(url, {
        method: "PUT",
        headers,
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`API call failed: ${response.statusText}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Error updating documents:", error);
      throw error;
    }
  }

  /**
   * Delete documents from the collection.
   * @param filter - The filter to match the documents to delete
   */
  public async delete(filter: object): Promise<object> {
    const url = this.getCollectionUrl();
    const headers = this.getHeaders();
    const data = { filter };

    try {
      const response = await fetch(url, {
        method: "DELETE",
        headers,
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`API call failed: ${response.statusText}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Error deleting documents:", error);
      throw error;
    }
  }

  /**
   * Find documents in the collection.
   * @param filter - The filter to match the documents
   * @param projection - Optional projection to include/exclude fields
   * @param sort - Optional sort order
   * @param limit - Optional maximum number of documents to return
   * @param skip - Optional number of documents to skip
   */
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

    try {
      const response = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`API call failed: ${response.statusText}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Error finding documents:", error);
      throw error;
    }
  }

  /**
   * Query documents in the collection using embeddings.
   * @param query - The query text to search for
   * @param embModel - The embedding model to use
   * @param topK - The number of top matches to return
   * @param includeValues - Whether to include embedding values in the response
   * @param projection - Optional projection for included fields
   */
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

    try {
      const response = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`API call failed: ${response.statusText}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Error querying documents:", error);
      throw error;
    }
  }
}
