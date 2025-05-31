import { EmbModels } from "./embModels";
import { VisionModels } from "./visionModels";

export interface ImageIndexOptions {
  embModel?: string;
  visionModel?: string;
  maxChunkSize?: number;
  chunkOverlap?: number;
  isSeparatorRegex?: boolean;
  separators?: string[] | null;
  keepSeparator?: boolean;
}

export class Image {
  private data: string;
  private mimeType: string;
  private _chunks: string[];
  private _url: string | null;
  private embModel: string | null;
  private visionModel: string | null;
  private maxChunkSize: number | null;
  private chunkOverlap: number | null;
  private isSeparatorRegex: boolean | null;
  private separators: string[] | null;
  private keepSeparator: boolean | null;
  private indexEnabled: boolean;

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

  constructor(data: string, mimeType: string) {
    if (!Image.isValidData(data)) {
      throw new Error("Invalid data: must be a non-empty string containing valid base64-encoded image data.");
    }
    
    // MIME type validation only matters when indexing
    // so we don't validate it here anymore

    this.data = data;
    this.mimeType = mimeType;
    this._chunks = [];
    this._url = null;
    
    // Optional parameters - set to null initially
    this.embModel = null;
    this.visionModel = null;
    this.maxChunkSize = null;
    this.chunkOverlap = null;
    this.isSeparatorRegex = null;
    this.separators = null;
    this.keepSeparator = null;
    this.indexEnabled = false; // Default to false when index() isn't called
  }

  public enableIndex(options: ImageIndexOptions = {}): Image {
    // Set index to true when this method is called
    this.indexEnabled = true;
    
    // MIME type validation happens here when indexing is enabled
    if (!Image.isValidMimeType(this.mimeType)) {
      const supportedList = Image.SUPPORTED_MIME_TYPES.join(", ");
      throw new Error(`Unsupported mime type: '${this.mimeType}'. Supported types are: ${supportedList}`);
    }
    
    // Validate and set embedding model if provided
    if (options.embModel !== undefined) {
      if (!Image.isValidEmbModel(options.embModel)) {
        const supportedList = Image.SUPPORTED_EMB_MODELS.join(", ");
        throw new Error(`Invalid embedding model: '${options.embModel}' is not supported. Supported models are: ${supportedList}`);
      }
      this.embModel = options.embModel;
    }
    
    // Validate and set vision model if provided
    if (options.visionModel !== undefined) {
      if (!Image.isValidVisionModel(options.visionModel)) {
        const supportedList = Image.SUPPORTED_VISION_MODELS.join(", ");
        throw new Error(`Invalid vision model: '${options.visionModel}' is not supported. Supported models are: ${supportedList}`);
      }
      this.visionModel = options.visionModel;
    }
    
    // Set other parameters if provided
    if (options.maxChunkSize !== undefined) {
      this.maxChunkSize = options.maxChunkSize;
    }
    
    if (options.chunkOverlap !== undefined) {
      this.chunkOverlap = options.chunkOverlap;
    }
    
    if (options.isSeparatorRegex !== undefined) {
      this.isSeparatorRegex = options.isSeparatorRegex;
    }
    
    if (options.separators !== undefined) {
      this.separators = options.separators;
    }
    
    if (options.keepSeparator !== undefined) {
      this.keepSeparator = options.keepSeparator;
    }
    
    return this;
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
    return Image.SUPPORTED_MIME_TYPES.includes(mimeType);
  }

  private static isValidEmbModel(embModel: string): boolean {
    return Image.SUPPORTED_EMB_MODELS.includes(embModel);
  }

  private static isValidVisionModel(visionModel: string): boolean {
    return Image.SUPPORTED_VISION_MODELS.includes(visionModel);
  }

  public get chunks(): string[] {
    return this._chunks;
  }

  public get url(): string | null {
    return this._url;
  }

  public toJSON(): Record<string, any> {
    const result: Record<string, any> = {
      data: this.data,
      mime_type: this.mimeType,
      index: this.indexEnabled, // Always include index flag
    };
    
    // Only include chunks if they exist
    if (this._chunks && this._chunks.length > 0) {
      result.chunks = this._chunks;
    }
    
    // Include URL if it exists
    if (this._url) {
      result.url = this._url;
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
      "xImage": result
    };
  }

  public static fromJSON(data: Record<string, any>): Image {
    // Check if the data is wrapped with 'xImage'
    if ("xImage" in data) {
      data = data["xImage"];
    }
    
    const imageData = data["data"];
    if (imageData === undefined || imageData === null) {
      throw new Error("JSON data must include 'data' field under 'xImage'. This field should contain base64-encoded image data.");
    }

    const mimeType = data["mime_type"];
    if (mimeType === undefined || mimeType === null) {
      const supportedList = Image.SUPPORTED_MIME_TYPES.join(", ");
      throw new Error(`JSON data must include 'mime_type' field under 'xImage'. Supported types are: ${supportedList}`);
    }

    // Create the instance with required parameters
    const instance = new Image(imageData, mimeType);
    
    // If index is true in the data, call enableIndex() to set up indexing
    if (data["index"] === true) {
      instance.enableIndex({
        embModel: data["emb_model"],
        visionModel: data["vision_model"],
        maxChunkSize: data["max_chunk_size"],
        chunkOverlap: data["chunk_overlap"],
        isSeparatorRegex: data["is_separator_regex"],
        separators: data["separators"],
        keepSeparator: data["keep_separator"],
      });
    }
    // Otherwise just set the attributes without setting indexEnabled=true
    else {
      if ("emb_model" in data) {
        instance.embModel = data["emb_model"];
      }
      if ("vision_model" in data) {
        instance.visionModel = data["vision_model"];
      }
      if ("max_chunk_size" in data) {
        instance.maxChunkSize = data["max_chunk_size"];
      }
      if ("chunk_overlap" in data) {
        instance.chunkOverlap = data["chunk_overlap"];
      }
      if ("is_separator_regex" in data) {
        instance.isSeparatorRegex = data["is_separator_regex"];
      }
      if ("separators" in data) {
        instance.separators = data["separators"];
      }
      if ("keep_separator" in data) {
        instance.keepSeparator = data["keep_separator"];
      }
    }
    
    // Set chunks if they exist in the JSON
    if ("chunks" in data) {
      instance._chunks = data["chunks"] || [];
    }
    
    // Set URL if it exists in the JSON
    if ("url" in data) {
      instance._url = data["url"];
    }

    return instance;
  }

  public toString(): string {
    if (this._url) {
      return `Image(${this._url})`;
    }
    if (this._chunks.length > 0) {
      return `Image("${this._chunks[0]}")`;
    }
    return "Image(<raw data>)";
  }
} 