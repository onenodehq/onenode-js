"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VisionModels = void 0;
/**
 * VisionModels - Constants for supported vision models in CapybaraDB
 *
 * This class provides constants for the vision models supported by CapybaraDB.
 * These models are used to process and understand image content for multimodal applications.
 *
 * When creating an EmbImage object, you can specify which vision model to use.
 * Different models have different capabilities in terms of:
 * - Image understanding quality
 * - Processing speed
 * - Cost
 * - Feature support
 *
 * Usage:
 * ```typescript
 * import { EmbImage, VisionModels } from "capybaradb";
 *
 * // Create an EmbImage with a specific vision model
 * const image = new EmbImage(
 *   "base64_encoded_image_data",
 *   VisionModels.GPT_4O
 * );
 * ```
 */
var VisionModels = /** @class */ (function () {
    function VisionModels() {
    }
    /**
     * OpenAI's GPT-4o model
     *
     * A multimodal model that can process both text and images.
     * Provides high-quality image understanding and can generate
     * detailed descriptions and insights from visual content.
     */
    VisionModels.GPT_4O = "gpt-4o";
    /**
     * OpenAI's GPT-4o-mini model
     *
     * A smaller, faster version of GPT-4o with reduced capabilities.
     * Good for applications where speed is more important than
     * the most detailed image understanding.
     */
    VisionModels.GPT_4O_MINI = "gpt-4o-mini";
    /**
     * OpenAI's GPT-4-turbo model
     *
     * An optimized version of GPT-4 with vision capabilities.
     * Balances performance and quality for most vision applications.
     */
    VisionModels.GPT_4O_TURBO = "gpt-4-turbo";
    /**
     * OpenAI's o1 model
     *
     * The most advanced vision model with enhanced capabilities
     * for complex visual reasoning and understanding.
     */
    VisionModels.GPT_O1 = "o1";
    return VisionModels;
}());
exports.VisionModels = VisionModels;
