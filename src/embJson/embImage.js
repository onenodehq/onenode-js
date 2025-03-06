"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmbImage = void 0;
var embModels_1 = require("./embModels");
var visionModels_1 = require("./visionModels");
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
 *     // By default, uses EmbModels.TEXT_EMBEDDING_3_SMALL and VisionModels.GPT_4O_MINI
 *     // You can override with custom models:
 *     // EmbModels.TEXT_EMBEDDING_3_LARGE, // embModel - for embedding text chunks
 *     // VisionModels.GPT_4O, // visionModel - for image understanding
 *     "image/jpeg" // mimeType - required: specify the image format
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
var EmbImage = /** @class */ (function () {
    /**
     * Creates a new EmbImage instance for image storage and processing.
     *
     * @param data - Base64-encoded image data. Must be a non-empty string.
     * @param chunks - The text chunks generated from the image. This is auto-populated by the database
     *                 and should be left empty when creating a new EmbImage instance.
     * @param embModel - The embedding model to use for text chunks. Can be null if only using vision model.
     * @param visionModel - The vision model to use for analyzing the image. Can be null if only storing the image.
     * @param mimeType - The MIME type of the image (e.g., "image/jpeg", "image/png"). Must be one of the supported types.
     *                  This parameter is required.
     * @param maxChunkSize - Maximum character length for each text chunk. Defaults to 200.
     * @param chunkOverlap - Number of overlapping characters between consecutive chunks. Defaults to 20.
     * @param isSeparatorRegex - Whether to treat separators as regex patterns. Defaults to false.
     * @param separators - List of separator strings or regex patterns. Defaults to null.
     * @param keepSeparator - If true, separators remain in the chunked text. Defaults to false.
     *
     * @throws Error if the data is not a valid base64 string, if the mime type is not supported, or if the models are not supported.
     */
    function EmbImage(data, chunks, embModel, visionModel, mimeType, maxChunkSize, chunkOverlap, isSeparatorRegex, separators, keepSeparator) {
        if (chunks === void 0) { chunks = []; }
        if (embModel === void 0) { embModel = embModels_1.EmbModels.TEXT_EMBEDDING_3_SMALL; }
        if (visionModel === void 0) { visionModel = visionModels_1.VisionModels.GPT_4O_MINI; }
        if (maxChunkSize === void 0) { maxChunkSize = 200; }
        if (chunkOverlap === void 0) { chunkOverlap = 20; }
        if (isSeparatorRegex === void 0) { isSeparatorRegex = false; }
        if (separators === void 0) { separators = null; }
        if (keepSeparator === void 0) { keepSeparator = false; }
        if (!EmbImage.isValidData(data)) {
            throw new Error("Invalid data: must be a non-empty string containing valid base64-encoded image data.");
        }
        if (!EmbImage.isValidMimeType(mimeType)) {
            var supportedList = EmbImage.SUPPORTED_MIME_TYPES.join(", ");
            throw new Error("Unsupported mime type: '".concat(mimeType, "'. Supported types are: ").concat(supportedList));
        }
        if (embModel !== null && !EmbImage.isValidEmbModel(embModel)) {
            var supportedList = EmbImage.SUPPORTED_EMB_MODELS.join(", ");
            throw new Error("Invalid embedding model: '".concat(embModel, "' is not supported. Supported models are: ").concat(supportedList));
        }
        if (visionModel !== null && !EmbImage.isValidVisionModel(visionModel)) {
            var supportedList = EmbImage.SUPPORTED_VISION_MODELS.join(", ");
            throw new Error("Invalid vision model: '".concat(visionModel, "' is not supported. Supported models are: ").concat(supportedList));
        }
        this.data = data;
        this.mimeType = mimeType;
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
    EmbImage.isValidData = function (data) {
        if (typeof data !== "string" || data.trim().length === 0) {
            return false;
        }
        try {
            // Check if the string is valid base64
            Buffer.from(data, "base64");
            return true;
        }
        catch (_a) {
            return false;
        }
    };
    /**
     * Validate that 'mimeType' is in the supported list
     */
    EmbImage.isValidMimeType = function (mimeType) {
        return EmbImage.SUPPORTED_MIME_TYPES.includes(mimeType);
    };
    /**
     * Validate that 'embModel' is in the supported list
     */
    EmbImage.isValidEmbModel = function (embModel) {
        return EmbImage.SUPPORTED_EMB_MODELS.includes(embModel);
    };
    /**
     * Validate that 'visionModel' is in the supported list
     */
    EmbImage.isValidVisionModel = function (visionModel) {
        return EmbImage.SUPPORTED_VISION_MODELS.includes(visionModel);
    };
    /**
     * Return a JSON representation of this object
     */
    EmbImage.prototype.toJSON = function () {
        // Start with required fields
        var result = {
            data: this.data,
            mime_type: this.mimeType,
        };
        // Only include chunks if they exist
        if (this.chunks && this.chunks.length > 0) {
            result.chunks = this.chunks;
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
    };
    /**
     * Restore an EmbImage object from its JSON representation.
     * Defaults are applied if any properties are missing.
     */
    EmbImage.fromJSON = function (data) {
        var imageData = data["data"];
        if (imageData === undefined || imageData === null) {
            throw new Error("JSON data must include 'data' field under '@embImage'. This field should contain base64-encoded image data.");
        }
        var mimeType = data["mime_type"];
        if (mimeType === undefined || mimeType === null) {
            var supportedList = EmbImage.SUPPORTED_MIME_TYPES.join(", ");
            throw new Error("JSON data must include 'mime_type' field under '@embImage'. Supported types are: ".concat(supportedList));
        }
        var chunks = data["chunks"] || [];
        var embModel = data["emb_model"] || embModels_1.EmbModels.TEXT_EMBEDDING_3_SMALL;
        var visionModel = data["vision_model"] || visionModels_1.VisionModels.GPT_4O_MINI;
        var maxChunkSize = data["max_chunk_size"] || 200;
        var chunkOverlap = data["chunk_overlap"] || 20;
        var isSeparatorRegex = data["is_separator_regex"] || false;
        var separators = data["separators"] || null;
        var keepSeparator = data["keep_separator"] || false;
        return new EmbImage(imageData, chunks, embModel, visionModel, mimeType, maxChunkSize, chunkOverlap, isSeparatorRegex, separators, keepSeparator);
    };
    /**
     * String representation of the EmbImage instance
     */
    EmbImage.prototype.toString = function () {
        if (this.chunks.length > 0) {
            return "EmbImage(\"".concat(this.chunks[0], "\")");
        }
        return "EmbImage(<raw data>)";
    };
    /**
     * List of supported embedding models for processing text chunks
     */
    EmbImage.SUPPORTED_EMB_MODELS = [
        embModels_1.EmbModels.TEXT_EMBEDDING_3_SMALL,
        embModels_1.EmbModels.TEXT_EMBEDDING_3_LARGE,
        embModels_1.EmbModels.TEXT_EMBEDDING_ADA_002,
    ];
    /**
     * List of supported vision models for analyzing images
     */
    EmbImage.SUPPORTED_VISION_MODELS = [
        visionModels_1.VisionModels.GPT_4O_MINI,
        visionModels_1.VisionModels.GPT_4O,
        visionModels_1.VisionModels.GPT_4O_TURBO,
        visionModels_1.VisionModels.GPT_O1,
    ];
    /**
     * List of supported MIME types for images
     */
    EmbImage.SUPPORTED_MIME_TYPES = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
        "image/webp",
    ];
    return EmbImage;
}());
exports.EmbImage = EmbImage;
