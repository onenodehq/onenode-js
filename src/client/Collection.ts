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
    return `https://api.onenode.ai/v1/db/${this.projectId}_${this.dbName}/collection/${this.collectionName}/document`;
  }

  private getHeaders(): HeadersInit {
    return {
      Authorization: `Bearer ${this.apiKey}`,
      "Content-Type": "application/json",
    };
  }

  /**
   * Insert one document into the collection.
   * @param document - The document to insert
   */
  public async insertOne(document: object): Promise<object> {
    const url = this.getCollectionUrl();
    const headers = this.getHeaders();
    const data = { documents: [document] };

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
    const data = { documents: documents };

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
}
