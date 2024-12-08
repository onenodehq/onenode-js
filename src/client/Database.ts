import { Collection } from "./Collection";

export class Database {
    private projectId: string;
    private dbName: string;

    constructor(projectId: string, dbName: string) {
        this.projectId = projectId;
        this.dbName = dbName;
    }

    /**
     * Get a collection instance within this database.
     * @param collectionName - The name of the collection
     */
    public collection(collectionName: string): Collection {
        return new Collection(this.projectId, this.dbName, collectionName);
    }
}
