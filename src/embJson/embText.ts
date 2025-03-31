import { EmbModels } from "./embModels";
export class EmbText {
  private text: string;
  private chunks: string[];
  private embModel: string;
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

  private static isValidText(text: string): boolean {
    return typeof text === "string" && text.trim().length > 0;
  }

  private static isValidEmbModel(embModel: string): boolean {
    return EmbText.SUPPORTED_EMB_MODELS.includes(embModel);
  }

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

  public toString(): string {
    return `EmbText(\"${this.text}\")`;
  }
}
