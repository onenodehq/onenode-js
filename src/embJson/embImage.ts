import { EmbModels } from "./embModels";
import { VisionModels } from "./visionModels";

/**
 * EmbImage - A specialized data type for storing and processing images in CapybaraDB
 * 
 * EmbImage enables multimodal capabilities by storing images that can be:
 * 1. Processed by vision models to extract textual descriptions
 * 2. Embedded for vector search (using the extracted descriptions)
 * 3. Stored alongside other document data
 * 
 * When stored in the database, the image is processed asynchronously in the background:
 * - If a vision model is specified, the image is analyzed to generate textual descriptions
 * - If an embedding model is specified, these descriptions are embedded for semantic search
 * - The results are stored in the 'chunks' property
 * 
 * Usage:
 * ```typescript
 * import { CapybaraDB, EmbImage, VisionModels } from "capybaradb";
 * import fs from "fs";
 * 
 * // Read an image file and convert to base64
 * const imageBuffer = fs.readFileSync("path/to/image.jpg");
 * const base64Image = imageBuffer.toString("base64");
 * 
 * // Create a document with an EmbImage field
 * const document = {
 *   title: "Image Document",
 *   image: new EmbImage(
 *     base64Image,
 *     [], // chunks - leave empty, will be populated by the database
 *     null, // embModel - can be null if only using vision model
 *     VisionModels.GPT_4O // visionModel - for image understanding
 *   )
 * };
 * 
 * // Insert into CapybaraDB
 * const client = new CapybaraDB();
 * await client.db("my_database").collection("my_collection").insert([document]);
 * 
 * // Later, you can perform semantic searches that include image content
 * ```
 */
export class EmbImage {
  /**
   * The base64-encoded image data
   */
  private data: string;
  
  /**
   * The text chunks generated from the image by the vision model
   * This is auto-populated by the database and should not be set directly by users
   */
  private chunks: string[];
  
  /**
   * The embedding model to use for generating embeddings from the text chunks
   * Can be null if only using a vision model without embedding
   */
  private embModel: string | null;
  
  /**
   * The vision model to use for analyzing the image and generating text descriptions
   * Can be null if only storing the image without analysis
   */
  private visionModel: string | null;
  
  /**
   * Maximum character length for each text chunk when processing vision model output
   */
  private maxChunkSize: number;
  
  /**
   * Number of overlapping characters between consecutive chunks
   */
  private chunkOverlap: number;
  
  /**
   * Whether to treat separators as regex patterns
   */
  private isSeparatorRegex: boolean;
  
  /**
   * List of separator strings or regex patterns used to split the text
   */
  private separators: string[] | null;
  
  /**
   * Whether to keep separators in the chunked text
   */
  private keepSeparator: boolean;

  /**
   * List of supported embedding models for processing text chunks
   */
  private static SUPPORTED_EMB_MODELS: string[] = [
    EmbModels.TEXT_EMBEDDING_3_SMALL,
    EmbModels.TEXT_EMBEDDING_3_LARGE,
    EmbModels.TEXT_EMBEDDING_ADA_002,
  ];

  /**
   * List of supported vision models for analyzing images
   */
  private static SUPPORTED_VISION_MODELS: string[] = [
    VisionModels.GPT_4O_MINI,
    VisionModels.GPT_4O,
    VisionModels.GPT_4O_TURBO,
    VisionModels.GPT_O1,
  ];

  /**
   * Creates a new EmbImage instance for image storage and processing.
   * 
   * @param data - Base64-encoded image data. Must be a non-empty string.
   * @param chunks - The text chunks generated from the image. This is auto-populated by the database
   *                 and should be left empty when creating a new EmbImage instance.
   * @param embModel - The embedding model to use for text chunks. Can be null if only using vision model.
   * @param visionModel - The vision model to use for analyzing the image. Can be null if only storing the image.
   * @param maxChunkSize - Maximum character length for each text chunk. Defaults to 200.
   * @param chunkOverlap - Number of overlapping characters between consecutive chunks. Defaults to 20.
   * @param isSeparatorRegex - Whether to treat separators as regex patterns. Defaults to false.
   * @param separators - List of separator strings or regex patterns. Defaults to null.
   * @param keepSeparator - If true, separators remain in the chunked text. Defaults to false.
   * 
   * @throws Error if the data is not a valid base64 string or if the models are not supported.
   */
  constructor(
    data: string,
    chunks: string[] = [],
    embModel: string | null = null,
    visionModel: string | null = null,
    maxChunkSize: number = 200,
    chunkOverlap: number = 20,
    isSeparatorRegex: boolean = false,
    separators: string[] | null = null,
    keepSeparator: boolean = false
  ) {
    if (!EmbImage.isValidData(data)) {
      throw new Error("Invalid data: must be a non-empty base64 string.");
    }
    if (embModel !== null && !EmbImage.isValidEmbModel(embModel)) {
      throw new Error(`Invalid embedding model: ${embModel} is not supported.`);
    }
    if (visionModel !== null && !EmbImage.isValidVisionModel(visionModel)) {
      throw new Error(`Invalid vision model: ${visionModel} is not supported.`);
    }

    this.data = data;
    this.chunks = chunks;
    this.embModel = embModel;
    this.visionModel = visionModel;
    this.maxChunkSize = maxChunkSize;
    this.chunkOverlap = chunkOverlap;
    this.isSeparatorRegex = isSeparatorRegex;
    this.separators = separators;
    this.keepSeparator = keepSeparator;
  }

  /**
   * Validate that 'data' is a non-empty base64 string
   */
  private static isValidData(data: string): boolean {
    if (typeof data !== "string" || data.trim().length === 0) {
      return false;
    }
    try {
      // Check if the string is valid base64
      Buffer.from(data, "base64");
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Validate that 'embModel' is in the supported list
   */
  private static isValidEmbModel(embModel: string): boolean {
    return EmbImage.SUPPORTED_EMB_MODELS.includes(embModel);
  }

  /**
   * Validate that 'visionModel' is in the supported list
   */
  private static isValidVisionModel(visionModel: string): boolean {
    return EmbImage.SUPPORTED_VISION_MODELS.includes(visionModel);
  }

  /**
   * Return a JSON representation of this object
   */
  public toJSON(): Record<string, any> {
    return {
      "@embImage": {
        data: this.data,
        chunks: this.chunks,
        emb_model: this.embModel,
        vision_model: this.visionModel,
        max_chunk_size: this.maxChunkSize,
        chunk_overlap: this.chunkOverlap,
        is_separator_regex: this.isSeparatorRegex,
        separators: this.separators,
        keep_separator: this.keepSeparator,
      },
    };
  }

  /**
   * Restore an EmbImage object from its JSON representation.
   * Defaults are applied if any properties are missing.
   */
  public static fromJSON(data: Record<string, any>): EmbImage {
    const imageData = data["data"];
    if (imageData === undefined || imageData === null) {
      throw new Error("JSON data must include 'data' under '@embImage'.");
    }

    const chunks = data["chunks"] || [];
    const embModel = data["emb_model"] || null;
    const visionModel = data["vision_model"] || null;
    const maxChunkSize = data["max_chunk_size"] || 200;
    const chunkOverlap = data["chunk_overlap"] || 20;
    const isSeparatorRegex = data["is_separator_regex"] || false;
    const separators = data["separators"] || null;
    const keepSeparator = data["keep_separator"] || false;

    return new EmbImage(
      imageData,
      chunks,
      embModel,
      visionModel,
      maxChunkSize,
      chunkOverlap,
      isSeparatorRegex,
      separators,
      keepSeparator
    );
  }

  /**
   * String representation of the EmbImage instance
   */
  public toString(): string {
    if (this.chunks.length > 0) {
      return `EmbImage("${this.chunks[0]}")`;
    }
    return "EmbImage(<raw data>)";
  }
} 