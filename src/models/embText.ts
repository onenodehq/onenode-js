import { EmbTextData } from "../types/embText";
import { SupportedEmbModels } from "../types/supportedModels";

export class EmbText {
  private text: string;
  private embModel?: SupportedEmbModels;

  constructor(text: string, embModel?: SupportedEmbModels) {
    if (!EmbText.isValidText(text)) {
      throw new Error("Invalid text: must be a non-empty string.");
    }
    if (embModel && !EmbText.isValidEmbModel(embModel)) {
      throw new Error(`Invalid embedding model: ${embModel} is not supported.`);
    }
    this.text = text;
    this.embModel = embModel;
  }

  private static isValidText(text: string): boolean {
    return typeof text === "string" && text.trim().length > 0;
  }

  private static isValidEmbModel(embModel: string): boolean {
    const supportedModels: SupportedEmbModels[] = [
      "text-embedding-3-small",
      "text-embedding-3-large",
      "ada v2",
    ];
    return supportedModels.includes(embModel as SupportedEmbModels);
  }

  public toJSON(): EmbTextData {
    return {
      "@embText": {
        text: this.text,
        ...(this.embModel && { emb_model: this.embModel }),
      },
    };
  }

  public static fromJSON(data: EmbTextData): EmbText {
    const { text, emb_model } = data["@embText"];
    return new EmbText(text, emb_model);
  }
}
