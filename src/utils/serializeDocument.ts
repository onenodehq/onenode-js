import { EmbText } from "../embJson/embText";

export function serializeDocument(document: any): any {
  if (Array.isArray(document)) {
    return document.map(serializeDocument);
  }

  if (document instanceof EmbText) {
    return document.toJSON();
  }

  if (typeof document === "object" && document !== null) {
    return Object.fromEntries(
      Object.entries(document).map(([key, value]) => [
        key,
        serializeDocument(value),
      ])
    );
  }

  return document;
}
