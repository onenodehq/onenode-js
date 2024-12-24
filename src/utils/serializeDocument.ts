import { EmbText } from "../embJson/embText";

export function serializeDocument(document: any): any {
  if (Array.isArray(document)) {
    return document.map(serializeDocument); // Recursively process arrays
  }

  if (document instanceof EmbText) {
    return document.toJSON(); // Convert EmbText to JSON
  }

  if (typeof document === "object" && document !== null) {
    return Object.fromEntries(
      Object.entries(document).map(([key, value]) => [
        key,
        serializeDocument(value),
      ])
    );
  }

  return document; // Primitive values are returned as-is
}
