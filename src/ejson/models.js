"use strict";
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Models = void 0;
var Models = /** @class */ (function () {
    function Models() {
    }
    var _a, _b, _c, _d;
    /**
     * All supported model constants, grouped by task and vendor.
     */
    Models.TextToEmbedding = (_a = /** @class */ (function () {
            function class_1() {
            }
            return class_1;
        }()),
        __setFunctionName(_a, "TextToEmbedding"),
        /**
         * Embedding models, by vendor.
         */
        _a.OpenAI = (_b = /** @class */ (function () {
                function class_2() {
                }
                class_2.values = function () {
                    return [
                        this.TEXT_EMBEDDING_3_SMALL,
                        this.TEXT_EMBEDDING_3_LARGE,
                        this.TEXT_EMBEDDING_ADA_002,
                    ];
                };
                return class_2;
            }()),
            __setFunctionName(_b, "OpenAI"),
            _b.TEXT_EMBEDDING_3_SMALL = "text-embedding-3-small",
            _b.TEXT_EMBEDDING_3_LARGE = "text-embedding-3-large",
            _b.TEXT_EMBEDDING_ADA_002 = "text-embedding-ada-002",
            _b),
        _a);
    Models.ImageToText = (_c = /** @class */ (function () {
            function class_3() {
            }
            return class_3;
        }()),
        __setFunctionName(_c, "ImageToText"),
        /**
         * Vision-to-text models, by vendor.
         */
        _c.OpenAI = (_d = /** @class */ (function () {
                function class_4() {
                }
                class_4.values = function () {
                    return [
                        this.GPT_4O,
                        this.GPT_4O_MINI,
                        this.O4_MINI,
                        this.O3,
                        this.O1,
                        this.O1_PRO,
                        this.GPT_4_1,
                        this.GPT_4_1_MINI,
                        this.GPT_4_1_NANO,
                    ];
                };
                return class_4;
            }()),
            __setFunctionName(_d, "OpenAI"),
            _d.GPT_4O = "gpt-4o",
            _d.GPT_4O_MINI = "gpt-4o-mini",
            _d.O4_MINI = "o4-mini",
            _d.O3 = "o3",
            _d.O1 = "o1",
            _d.O1_PRO = "o1-pro",
            _d.GPT_4_1 = "gpt-4.1",
            _d.GPT_4_1_MINI = "gpt-4.1-mini",
            _d.GPT_4_1_NANO = "gpt-4.1-nano",
            _d),
        _c);
    return Models;
}());
exports.Models = Models;
