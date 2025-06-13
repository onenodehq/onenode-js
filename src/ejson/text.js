"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Text = void 0;
var models_1 = require("./models");
var Text = /** @class */ (function () {
    function Text(text) {
        if (!Text.isValidText(text)) {
            throw new Error("Invalid text: must be a non-empty string.");
        }
        this.text = text;
        this.chunks = [];
        // Optional parameters - set to null initially
        this.embModel = null;
        this.maxChunkSize = null;
        this.chunkOverlap = null;
        this.isSeparatorRegex = null;
        this.separators = null;
        this.keepSeparator = null;
        this.indexEnabled = false; // Default to false when index() isn't called
    }
    Text.prototype.enableIndex = function (options) {
        if (options === void 0) { options = {}; }
        // Set index to true when this method is called
        this.indexEnabled = true;
        // Validate and set embedding model if provided
        if (options.embModel !== undefined) {
            if (!Text.isValidEmbModel(options.embModel)) {
                throw new Error("Invalid embedding model: ".concat(options.embModel, " is not supported."));
            }
            this.embModel = options.embModel;
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
    };
    Text.isValidText = function (text) {
        return typeof text === "string" && text.trim().length > 0;
    };
    Text.isValidEmbModel = function (embModel) {
        return models_1.Models.TextToEmbedding.OpenAI.values().includes(embModel);
    };
    Text.prototype._serialize = function () {
        var result = {
            text: this.text,
            chunks: this.chunks,
            index: this.indexEnabled, // Always include index flag
        };
        // Add other fields only if they are not null (when set via index() method)
        if (this.embModel !== null) {
            result.emb_model = this.embModel;
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
            "xText": result
        };
    };
    Text._deserialize = function (data) {
        // Check if the data is wrapped with 'xText'
        if ("xText" in data) {
            data = data["xText"];
        }
        var text = data["text"];
        if (text === undefined || text === null) {
            throw new Error("JSON data must include 'text' under 'xText'.");
        }
        // Create the instance with just the text
        var instance = new Text(text);
        // If index is true in the data, call enableIndex() to set up indexing
        if (data["index"] === true) {
            instance.enableIndex({
                embModel: data["emb_model"],
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
        instance.chunks = data["chunks"] || [];
        return instance;
    };
    Text.prototype.toString = function () {
        return "Text(\"".concat(this.text, "\")");
    };
    return Text;
}());
exports.Text = Text;
