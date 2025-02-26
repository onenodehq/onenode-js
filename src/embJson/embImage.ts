import { EmbModels } from "./embModels";
import { VisionModels } from "./visionModels";

export class EmbImage {
  private data: string;
  private chunks: string[];
  private embModel: string | null;
  private visionModel: string | null;
  private maxChunkSize: number;
  private chunkOverlap: number;
  private isSeparatorRegex: boolean;
  private separators: string[] | null;
  private keepSeparator: boolean;

  private static SUPPORTED_EMB_MODELS: string[] = [
    EmbModels.TEXT_EMBEDDING_3_SMALL,
    EmbModels.TEXT_EMBEDDING_3_LARGE,
    EmbModels.TEXT_EMBEDDING_ADA_002,
  ];

  private static SUPPORTED_VISION_MODELS: string[] = [
    VisionModels.GPT_4O_MINI,
    VisionModels.GPT_4O,
    VisionModels.GPT_4O_TURBO,
    VisionModels.GPT_O1,
  ];

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