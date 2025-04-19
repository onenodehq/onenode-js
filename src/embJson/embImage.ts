import { EmbModels } from "./embModels";
import { VisionModels } from "./visionModels";

export class EmbImage {
  private data: string;
  private mimeType: string;
  private _chunks: string[];
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
    VisionModels.GPT_4_TURBO,
    VisionModels.O1,
  ];
  
  private static SUPPORTED_MIME_TYPES: string[] = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
  ];

  constructor(
    data: string,
    chunks: string[] = [],
    embModel: string | null = EmbModels.TEXT_EMBEDDING_3_SMALL,
    visionModel: string | null = VisionModels.GPT_4O_MINI,
    mimeType: string,
    maxChunkSize: number | null = null,
    chunkOverlap: number | null = null,
    isSeparatorRegex: boolean = false,
    separators: string[] | null = null,
    keepSeparator: boolean = false
  ) {
    if (!EmbImage.isValidData(data)) {
      throw new Error("Invalid data: must be a non-empty string containing valid base64-encoded image data.");
    }
    if (!EmbImage.isValidMimeType(mimeType)) {
      const supportedList = EmbImage.SUPPORTED_MIME_TYPES.join(", ");
      throw new Error(`Unsupported mime type: '${mimeType}'. Supported types are: ${supportedList}`);
    }
    if (embModel !== null && !EmbImage.isValidEmbModel(embModel)) {
      const supportedList = EmbImage.SUPPORTED_EMB_MODELS.join(", ");
      throw new Error(`Invalid embedding model: '${embModel}' is not supported. Supported models are: ${supportedList}`);
    }
    if (visionModel !== null && !EmbImage.isValidVisionModel(visionModel)) {
      const supportedList = EmbImage.SUPPORTED_VISION_MODELS.join(", ");
      throw new Error(`Invalid vision model: '${visionModel}' is not supported. Supported models are: ${supportedList}`);
    }

    this.data = data;
    this.mimeType = mimeType;
    this._chunks = chunks;
    this.embModel = embModel;
    this.visionModel = visionModel;
    this.maxChunkSize = maxChunkSize !== null ? maxChunkSize : 0;
    this.chunkOverlap = chunkOverlap !== null ? chunkOverlap : 0;
    this.isSeparatorRegex = isSeparatorRegex;
    this.separators = separators;
    this.keepSeparator = keepSeparator;
  }

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
  
  private static isValidMimeType(mimeType: string): boolean {
    return EmbImage.SUPPORTED_MIME_TYPES.includes(mimeType);
  }

  private static isValidEmbModel(embModel: string): boolean {
    return EmbImage.SUPPORTED_EMB_MODELS.includes(embModel);
  }

  private static isValidVisionModel(visionModel: string): boolean {
    return EmbImage.SUPPORTED_VISION_MODELS.includes(visionModel);
  }

  public get chunks(): string[] {
    return this._chunks;
  }

  public toJSON(): Record<string, any> {
    const result: Record<string, any> = {
      data: this.data,
      mime_type: this.mimeType,
    };
    
    // Only include chunks if they exist
    if (this._chunks && this._chunks.length > 0) {
      result.chunks = this._chunks;
    }
    
    // Add other fields only if they are not null
    if (this.embModel !== null) {
      result.emb_model = this.embModel;
    }
    if (this.visionModel !== null) {
      result.vision_model = this.visionModel;
    }
    if (this.maxChunkSize !== null) {
      result.max_chunk_size = this.maxChunkSize;
    }
    if (this.chunkOverlap !== null) {
      result.chunk_overlap = this.chunkOverlap;
    }
    if (this.isSeparatorRegex !== null) {
      result.is_separator_regex = this.isSeparatorRegex;
    }
    if (this.separators !== null) {
      result.separators = this.separators;
    }
    if (this.keepSeparator !== null) {
      result.keep_separator = this.keepSeparator;
    }
    
    return {
      "@embImage": result
    };
  }

  public static fromJSON(data: Record<string, any>): EmbImage {
    // Check if the data is wrapped with '@embImage'
    if ("@embImage" in data) {
      data = data["@embImage"];
    }
    
    const imageData = data["data"];
    if (imageData === undefined || imageData === null) {
      throw new Error("JSON data must include 'data' field under '@embImage'. This field should contain base64-encoded image data.");
    }

    const mimeType = data["mime_type"];
    if (mimeType === undefined || mimeType === null) {
      const supportedList = EmbImage.SUPPORTED_MIME_TYPES.join(", ");
      throw new Error(`JSON data must include 'mime_type' field under '@embImage'. Supported types are: ${supportedList}`);
    }

    const chunks = data["chunks"] || [];
    const embModel = data["emb_model"] || EmbModels.TEXT_EMBEDDING_3_SMALL;
    const visionModel = data["vision_model"] || VisionModels.GPT_4O_MINI;
    const maxChunkSize = data["max_chunk_size"] || null;
    const chunkOverlap = data["chunk_overlap"] || null;
    const isSeparatorRegex = data["is_separator_regex"] || false;
    const separators = data["separators"] || null;
    const keepSeparator = data["keep_separator"] || false;

    return new EmbImage(
      imageData,
      chunks,
      embModel,
      visionModel,
      mimeType,
      maxChunkSize,
      chunkOverlap,
      isSeparatorRegex,
      separators,
      keepSeparator
    );
  }

  public toString(): string {
    if (this._chunks.length > 0) {
      return `EmbImage("${this._chunks[0]}")`;
    }
    return "EmbImage(<raw data>)";
  }
} 