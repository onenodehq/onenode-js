import { EmbModels } from "./embModels";

/**
 * EmbText is a specialized data type for storing and embedding text in CapybaraDB.
 * 
 * It enables semantic search capabilities by automatically chunking, embedding, and indexing text.
 * When stored in the database, the text is processed asynchronously in the background:
 * 1. The text is chunked based on the specified parameters
 * 2. Each chunk is embedded using the specified embedding model
 * 3. The embeddings are indexed for efficient semantic search
 * 
 * The 'chunks' property is auto-populated by the database after processing and is not meant 
 * to be set by the user directly (though it's included in the constructor for internal use).
 * 
 * @example
 * ```typescript
 * import { CapybaraDB, EmbText, EmbModels } from "capybaradb";
 * 
 * // Connect to CapybaraDB
 * const db = new CapybaraDB();
 * 
 * // Create a document with an EmbText field
 * const document = {
 *   title: "Sample Document",
 *   content: new EmbText(
 *     "This is a sample text that will be automatically embedded for semantic search.",
 *     [], // chunks - leave empty, will be populated by the database
 *     EmbModels.TEXT_EMBEDDING_3_SMALL,
 *     200, // maxChunkSize
 *     20   // chunkOverlap
 *   )
 * };
 * 
 * // Insert the document into a collection
 * await db.myDatabase.myCollection.insertOne(document);
 * 
 * // Later, you can perform semantic searches on this text
 * ```
 */
export class EmbText {
  /** The text content to be embedded */
  private text: string;
  
  /** 
   * The chunks generated from the text
   * This is auto-populated by the database and should not be set directly by users
   */
  private chunks: string[];
  
  /** The embedding model to use for generating embeddings */
  private embModel: string;
  
  /** Maximum character length for each text chunk */
  private maxChunkSize: number;
  
  /** Number of overlapping characters between consecutive chunks */
  private chunkOverlap: number;
  
  /** Whether to treat separators as regex patterns */
  private isSeparatorRegex: boolean;
  
  /** List of separator strings or regex patterns used to split the text */
  private separators: string[] | null;
  
  /** Whether to keep separators in the chunked text */
  private keepSeparator: boolean;

  /** List of supported embedding models */
  private static SUPPORTED_EMB_MODELS: string[] = [
    EmbModels.TEXT_EMBEDDING_3_SMALL,
    EmbModels.TEXT_EMBEDDING_3_LARGE,
    EmbModels.TEXT_EMBEDDING_ADA_002,
  ];

  /**
   * Creates a new EmbText instance for semantic text embedding.
   * 
   * @param text - The text content to be embedded. Must be a non-empty string.
   * @param chunks - The chunks generated from the text. This is auto-populated by the database
   *                 and should be left empty when creating a new EmbText instance.
   * @param embModel - The embedding model to use. Defaults to TEXT_EMBEDDING_3_SMALL.
   * @param maxChunkSize - Maximum character length for each text chunk. Larger chunks reduce
   *                      total chunk count but may reduce search efficiency. Defaults to 200.
   * @param chunkOverlap - Number of overlapping characters between consecutive chunks.
   *                      Helps preserve context at chunk boundaries. Defaults to 20.
   * @param isSeparatorRegex - Whether to treat separators as regex patterns. If true, each
   *                          separator in the list is treated as a regex pattern. Defaults to false.
   * @param separators - List of separator strings (or regex patterns if isSeparatorRegex=true)
   *                    used to split the text. For example: ["\n\n", "\n"]. Defaults to null.
   * @param keepSeparator - If true, separators remain in the chunked text. If false, they are
   *                       stripped out. Defaults to false.
   * 
   * @throws Error if the text is empty or the embedding model is not supported.
   */
  constructor(
    text: string,
    chunks: string[] = [],
    embModel: string = EmbModels.TEXT_EMBEDDING_3_SMALL,
    maxChunkSize: number = 200,
    chunkOverlap: number = 20,
    isSeparatorRegex: boolean = false,
    separators: string[] | null = null,
    keepSeparator: boolean = false
  ) {
    if (!EmbText.isValidText(text)) {
      throw new Error("Invalid text: must be a non-empty string.");
    }
    if (!EmbText.isValidEmbModel(embModel)) {
      throw new Error(`Invalid embedding model: ${embModel} is not supported.`);
    }

    this.text = text;
    this.chunks = chunks;
    this.embModel = embModel;
    this.maxChunkSize = maxChunkSize;
    this.chunkOverlap = chunkOverlap;
    this.isSeparatorRegex = isSeparatorRegex;
    this.separators = separators;
    this.keepSeparator = keepSeparator;
  }

  /**
   * Validate that 'text' is a non-empty string
   * 
   * @param text - The text to validate
   * @returns true if the text is valid, false otherwise
   */
  private static isValidText(text: string): boolean {
    return typeof text === "string" && text.trim().length > 0;
  }

  /**
   * Validate that 'embModel' is in the supported list
   * 
   * @param embModel - The embedding model to validate
   * @returns true if the embedding model is supported, false otherwise
   */
  private static isValidEmbModel(embModel: string): boolean {
    return EmbText.SUPPORTED_EMB_MODELS.includes(embModel);
  }

  /**
   * Convert the EmbText instance to a JSON-serializable object
   * 
   * This is primarily used internally by the CapybaraDB SDK.
   * 
   * @returns A JSON-serializable object representing the EmbText instance
   */
  public toJSON(): Record<string, any> {
    return {
      "@embText": {
        text: this.text,
        chunks: this.chunks,
        emb_model: this.embModel,
        max_chunk_size: this.maxChunkSize,
        chunk_overlap: this.chunkOverlap,
        is_separator_regex: this.isSeparatorRegex,
        separators: this.separators,
        keep_separator: this.keepSeparator,
      },
    };
  }

  /**
   * Create an EmbText instance from its JSON representation
   * 
   * This is primarily used internally by the CapybaraDB SDK when deserializing
   * data received from the database.
   * 
   * @param data - The JSON data containing EmbText properties
   * @returns A new EmbText instance created from the JSON data
   * @throws Error if the required 'text' field is missing
   */
  public static fromJSON(data: Record<string, any>): EmbText {
    const text = data["text"];
    if (text === undefined || text === null) {
      throw new Error("JSON data must include 'text' under '@embText'.");
    }

    const chunks = data["chunks"] || [];
    const embModel = data["emb_model"] || EmbModels.TEXT_EMBEDDING_3_SMALL;
    const maxChunkSize = data["max_chunk_size"] || 200;
    const chunkOverlap = data["chunk_overlap"] || 20;
    const isSeparatorRegex = data["is_separator_regex"] || false;
    const separators = data["separators"] || null;
    const keepSeparator = data["keep_separator"] || false;

    return new EmbText(
      text,
      chunks,
      embModel,
      maxChunkSize,
      chunkOverlap,
      isSeparatorRegex,
      separators,
      keepSeparator
    );
  }

  /**
   * Get a string representation of the EmbText instance
   * 
   * @returns A string representation of the EmbText instance
   */
  public toString(): string {
    return `EmbText(\"${this.text}\")`;
  }
}
