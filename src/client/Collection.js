"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Collection = void 0;
var bson_1 = require("bson");
var text_1 = require("../ejson/text");
var image_1 = require("../ejson/image");
var BSON_SERIALIZERS = {
    Text: function (v) { return v._serialize(); },
    Image: function (v) { return v._serialize(); },
    ObjectId: function (v) { return ({ $oid: v.toString() }); },
    Date: function (v) { return ({ $date: v.toISOString() }); },
    Decimal128: function (v) { return ({ $numberDecimal: v.toString() }); },
    Binary: function (v) { return ({ $binary: v.toString("hex") }); },
    RegExp: function (v) { return ({ $regex: v.source, $options: v.flags }); },
    Code: function (v) { return ({ $code: v.toString() }); },
    Timestamp: function (v) { return ({
        $timestamp: { t: v.getHighBits(), i: v.getLowBits() },
    }); },
    MinKey: function () { return ({ $minKey: 1 }); },
    MaxKey: function () { return ({ $maxKey: 1 }); },
};
var APIClientError = /** @class */ (function (_super) {
    __extends(APIClientError, _super);
    function APIClientError(statusCode, message) {
        var _this = _super.call(this, message) || this;
        _this.statusCode = statusCode;
        _this.message = message;
        _this.name = "APIClientError";
        Object.setPrototypeOf(_this, APIClientError.prototype);
        return _this;
    }
    return APIClientError;
}(Error));
var AuthenticationError = /** @class */ (function (_super) {
    __extends(AuthenticationError, _super);
    function AuthenticationError(statusCode, message) {
        var _this = _super.call(this, statusCode, message) || this;
        _this.name = "AuthenticationError";
        Object.setPrototypeOf(_this, AuthenticationError.prototype);
        return _this;
    }
    return AuthenticationError;
}(APIClientError));
var ClientRequestError = /** @class */ (function (_super) {
    __extends(ClientRequestError, _super);
    function ClientRequestError(statusCode, message) {
        var _this = _super.call(this, statusCode, message) || this;
        _this.name = "ClientRequestError";
        Object.setPrototypeOf(_this, ClientRequestError.prototype);
        return _this;
    }
    return ClientRequestError;
}(APIClientError));
var ServerError = /** @class */ (function (_super) {
    __extends(ServerError, _super);
    function ServerError(statusCode, message) {
        var _this = _super.call(this, statusCode, message) || this;
        _this.name = "ServerError";
        Object.setPrototypeOf(_this, ServerError.prototype);
        return _this;
    }
    return ServerError;
}(APIClientError));
var Collection = /** @class */ (function () {
    function Collection(apiKey, projectId, dbName, collectionName, isAnonymous) {
        if (isAnonymous === void 0) { isAnonymous = false; }
        this.apiKey = apiKey;
        this.projectId = projectId;
        this.dbName = dbName;
        this.collectionName = collectionName;
        this.isAnonymous = isAnonymous;
    }
    Collection.prototype.getCollectionUrl = function () {
        if (this.isAnonymous) {
            return "https://api.onenode.ai/v0/anon-project/".concat(this.projectId, "/db/").concat(this.dbName, "/collection/").concat(this.collectionName);
        }
        else {
            return "https://api.onenode.ai/v0/project/".concat(this.projectId, "/db/").concat(this.dbName, "/collection/").concat(this.collectionName);
        }
    };
    Collection.prototype.getDocumentUrl = function () {
        return "".concat(this.getCollectionUrl(), "/document");
    };
    Collection.prototype.getHeaders = function () {
        var headers = {};
        if (!this.isAnonymous) {
            headers.Authorization = "Bearer ".concat(this.apiKey);
        }
        return headers;
    };
    Collection.prototype.serialize = function (value, depth) {
        var _this = this;
        if (depth === void 0) { depth = 0; }
        if (depth > 100) {
            throw new Error("Too much nesting or circular structure in serialize()");
        }
        if (value === null ||
            typeof value === "undefined" ||
            typeof value === "boolean" ||
            typeof value === "number" ||
            typeof value === "string") {
            return value;
        }
        if (Array.isArray(value)) {
            return value.map(function (item) { return _this.serialize(item, depth + 1); });
        }
        if (value instanceof text_1.Text) {
            return value._serialize();
        }
        if (value instanceof image_1.Image) {
            return value._serialize();
        }
        var constructor = value.constructor;
        var serializer = BSON_SERIALIZERS[constructor.name];
        if (serializer) {
            return serializer(value);
        }
        if (typeof value === "object") {
            var result = {};
            for (var _i = 0, _a = Object.entries(value); _i < _a.length; _i++) {
                var _b = _a[_i], key = _b[0], val = _b[1];
                result[key] = this.serialize(val, depth + 1);
            }
            return result;
        }
        throw new TypeError("Unsupported BSON type: ".concat(typeof value));
    };
    Collection.prototype.deserialize = function (value, depth) {
        var _this = this;
        var _a;
        if (depth === void 0) { depth = 0; }
        if (depth > 100) {
            throw new Error("Too much nesting or circular structure in deserialize()");
        }
        if (value === null ||
            typeof value === "undefined" ||
            typeof value === "boolean" ||
            typeof value === "number" ||
            typeof value === "string") {
            return value;
        }
        if (Array.isArray(value)) {
            return value.map(function (item) { return _this.deserialize(item, depth + 1); });
        }
        var obj = value;
        if ("xText" in obj) {
            return text_1.Text._deserialize(obj);
        }
        if ("xImage" in obj) {
            return image_1.Image._deserialize(obj);
        }
        if ("$oid" in obj)
            return new bson_1.ObjectId(obj["$oid"]);
        if ("$date" in obj)
            return new Date(obj["$date"]);
        if ("$numberDecimal" in obj)
            return new bson_1.Decimal128(obj["$numberDecimal"]);
        if ("$binary" in obj)
            return new bson_1.Binary(Buffer.from(obj["$binary"], "hex"));
        if ("$regex" in obj) {
            return new RegExp(obj["$regex"], (_a = obj["$options"]) !== null && _a !== void 0 ? _a : "");
        }
        if ("$code" in obj)
            return new bson_1.Code(obj["$code"]);
        if ("$timestamp" in obj) {
            return bson_1.Timestamp.fromBits(obj["$timestamp"].t, obj["$timestamp"].i);
        }
        if ("$minKey" in obj)
            return new bson_1.MinKey();
        if ("$maxKey" in obj)
            return new bson_1.MaxKey();
        var nested = {};
        for (var _i = 0, _b = Object.entries(obj); _i < _b.length; _i++) {
            var _c = _b[_i], key = _c[0], val = _c[1];
            nested[key] = this.deserialize(val, depth + 1);
        }
        return nested;
    };
    Collection.prototype.extractBinaryData = function (documents) {
        return __awaiter(this, void 0, void 0, function () {
            var files, extractFromValue, docIndex;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        files = {};
                        extractFromValue = function (value_1, docIndex_1) {
                            var args_1 = [];
                            for (var _i = 2; _i < arguments.length; _i++) {
                                args_1[_i - 2] = arguments[_i];
                            }
                            return __awaiter(_this, __spreadArray([value_1, docIndex_1], args_1, true), void 0, function (value, docIndex, path) {
                                var fieldName, binaryData, blob, i, newPath, _a, _b, _c, key, val, newPath;
                                if (path === void 0) { path = ""; }
                                return __generator(this, function (_d) {
                                    switch (_d.label) {
                                        case 0:
                                            if (!(value instanceof image_1.Image && value.hasBinaryData())) return [3 /*break*/, 1];
                                            fieldName = path ? "doc_".concat(docIndex, ".").concat(path, ".xImage.data") : "doc_".concat(docIndex, ".xImage.data");
                                            binaryData = value.getBinaryData();
                                            if (binaryData) {
                                                blob = null;
                                                if (binaryData instanceof Blob) {
                                                    blob = binaryData;
                                                }
                                                else if (binaryData instanceof File) {
                                                    blob = binaryData;
                                                }
                                                else if (binaryData instanceof ArrayBuffer) {
                                                    blob = new Blob([binaryData]);
                                                }
                                                else if (binaryData instanceof Uint8Array) {
                                                    blob = new Blob([binaryData]);
                                                }
                                                if (blob) {
                                                    files[fieldName] = blob;
                                                }
                                            }
                                            return [3 /*break*/, 10];
                                        case 1:
                                            if (!Array.isArray(value)) return [3 /*break*/, 6];
                                            i = 0;
                                            _d.label = 2;
                                        case 2:
                                            if (!(i < value.length)) return [3 /*break*/, 5];
                                            newPath = path ? "".concat(path, ".").concat(i) : "".concat(i);
                                            return [4 /*yield*/, extractFromValue(value[i], docIndex, newPath)];
                                        case 3:
                                            _d.sent();
                                            _d.label = 4;
                                        case 4:
                                            i++;
                                            return [3 /*break*/, 2];
                                        case 5: return [3 /*break*/, 10];
                                        case 6:
                                            if (!(value && typeof value === "object")) return [3 /*break*/, 10];
                                            _a = 0, _b = Object.entries(value);
                                            _d.label = 7;
                                        case 7:
                                            if (!(_a < _b.length)) return [3 /*break*/, 10];
                                            _c = _b[_a], key = _c[0], val = _c[1];
                                            newPath = path ? "".concat(path, ".").concat(key) : key;
                                            return [4 /*yield*/, extractFromValue(val, docIndex, newPath)];
                                        case 8:
                                            _d.sent();
                                            _d.label = 9;
                                        case 9:
                                            _a++;
                                            return [3 /*break*/, 7];
                                        case 10: return [2 /*return*/];
                                    }
                                });
                            });
                        };
                        docIndex = 0;
                        _a.label = 1;
                    case 1:
                        if (!(docIndex < documents.length)) return [3 /*break*/, 4];
                        return [4 /*yield*/, extractFromValue(documents[docIndex], docIndex)];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3:
                        docIndex++;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/, files];
                }
            });
        });
    };
    Collection.prototype.handleResponse = function (response) {
        return __awaiter(this, void 0, void 0, function () {
            var errorData, code, message, jsonResponse, error_1;
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 4, , 5]);
                        if (!!response.ok) return [3 /*break*/, 2];
                        return [4 /*yield*/, response.json()];
                    case 1:
                        errorData = _c.sent();
                        code = (_a = errorData.code) !== null && _a !== void 0 ? _a : response.status;
                        message = (_b = errorData.message) !== null && _b !== void 0 ? _b : "An unknown error occurred.";
                        if (code === 401) {
                            throw new AuthenticationError(code, message);
                        }
                        else if (code >= 400 && code < 500) {
                            throw new ClientRequestError(code, message);
                        }
                        else {
                            throw new ServerError(code, message);
                        }
                        _c.label = 2;
                    case 2: return [4 /*yield*/, response.json()];
                    case 3:
                        jsonResponse = _c.sent();
                        return [2 /*return*/, this.deserialize(jsonResponse)];
                    case 4:
                        error_1 = _c.sent();
                        if (error_1 instanceof APIClientError) {
                            throw error_1;
                        }
                        throw new APIClientError(response.status, response.statusText);
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    Collection.prototype.insert = function (documents) {
        return __awaiter(this, void 0, void 0, function () {
            var url, headers, serializedDocs, binaryFiles, formData, _i, _a, _b, fieldName, blob, response;
            var _this = this;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        url = this.getDocumentUrl();
                        headers = this.getHeaders();
                        serializedDocs = documents.map(function (doc) { return _this.serialize(doc); });
                        return [4 /*yield*/, this.extractBinaryData(documents)];
                    case 1:
                        binaryFiles = _c.sent();
                        formData = new FormData();
                        formData.append('documents', JSON.stringify(serializedDocs));
                        // Add binary files to form data
                        for (_i = 0, _a = Object.entries(binaryFiles); _i < _a.length; _i++) {
                            _b = _a[_i], fieldName = _b[0], blob = _b[1];
                            formData.append(fieldName, blob, fieldName);
                        }
                        return [4 /*yield*/, fetch(url, {
                                method: "POST",
                                headers: headers,
                                body: formData,
                            })];
                    case 2:
                        response = _c.sent();
                        return [2 /*return*/, this.handleResponse(response)];
                }
            });
        });
    };
    Collection.prototype.update = function (filter_1, update_1) {
        return __awaiter(this, arguments, void 0, function (filter, update, upsert) {
            var url, headers, binaryFiles, formData, _i, _a, _b, fieldName, blob, response;
            if (upsert === void 0) { upsert = false; }
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        url = this.getDocumentUrl();
                        headers = this.getHeaders();
                        return [4 /*yield*/, this.extractBinaryData([update])];
                    case 1:
                        binaryFiles = _c.sent();
                        formData = new FormData();
                        formData.append('filter', JSON.stringify(this.serialize(filter)));
                        formData.append('update', JSON.stringify(this.serialize(update)));
                        formData.append('upsert', String(upsert));
                        // Add binary files to form data
                        for (_i = 0, _a = Object.entries(binaryFiles); _i < _a.length; _i++) {
                            _b = _a[_i], fieldName = _b[0], blob = _b[1];
                            formData.append(fieldName, blob, fieldName);
                        }
                        return [4 /*yield*/, fetch(url, {
                                method: "PUT",
                                headers: headers,
                                body: formData,
                            })];
                    case 2:
                        response = _c.sent();
                        return [2 /*return*/, this.handleResponse(response)];
                }
            });
        });
    };
    Collection.prototype.delete = function (filter) {
        return __awaiter(this, void 0, void 0, function () {
            var url, headers, formData, response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        url = this.getDocumentUrl();
                        headers = this.getHeaders();
                        formData = new FormData();
                        formData.append('filter', JSON.stringify(this.serialize(filter)));
                        return [4 /*yield*/, fetch(url, {
                                method: "DELETE",
                                headers: headers,
                                body: formData,
                            })];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, this.handleResponse(response)];
                }
            });
        });
    };
    Collection.prototype.find = function (filter, projection, sort, limit, skip) {
        return __awaiter(this, void 0, void 0, function () {
            var url, headers, formData, response, responseData;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        url = "".concat(this.getCollectionUrl(), "/document/find");
                        headers = this.getHeaders();
                        formData = new FormData();
                        formData.append('filter', JSON.stringify(this.serialize(filter)));
                        if (projection !== undefined) {
                            formData.append('projection', JSON.stringify(projection));
                        }
                        if (sort !== undefined) {
                            formData.append('sort', JSON.stringify(sort));
                        }
                        if (limit !== undefined) {
                            formData.append('limit', String(limit));
                        }
                        if (skip !== undefined) {
                            formData.append('skip', String(skip));
                        }
                        return [4 /*yield*/, fetch(url, {
                                method: "POST",
                                headers: headers,
                                body: formData,
                            })];
                    case 1:
                        response = _a.sent();
                        return [4 /*yield*/, this.handleResponse(response)];
                    case 2:
                        responseData = _a.sent();
                        return [2 /*return*/, (responseData.docs || [])];
                }
            });
        });
    };
    /**
     * Perform semantic search on the collection.
     *
     * Returns an array of QueryMatch objects with the following structure:
     * - chunk: Text chunk that matched the query
     * - path: Document field path where the match was found
     * - chunk_n: Index of the chunk
     * - score: Similarity score (0-1)
     * - document: Full document containing the match
     * - values: Embedding vector values (optional, when includeValues=true)
     */
    Collection.prototype.query = function (query, options) {
        return __awaiter(this, void 0, void 0, function () {
            var url, headers, formData, response, responseData;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        url = "".concat(this.getCollectionUrl(), "/document/query");
                        headers = this.getHeaders();
                        formData = new FormData();
                        formData.append('query', query);
                        if ((options === null || options === void 0 ? void 0 : options.filter) != null) {
                            formData.append('filter', JSON.stringify(this.serialize(options.filter)));
                        }
                        if ((options === null || options === void 0 ? void 0 : options.projection) != null) {
                            formData.append('projection', JSON.stringify(options.projection));
                        }
                        if ((options === null || options === void 0 ? void 0 : options.embModel) != null) {
                            formData.append('emb_model', options.embModel);
                        }
                        if ((options === null || options === void 0 ? void 0 : options.topK) != null) {
                            formData.append('top_k', String(options.topK));
                        }
                        if ((options === null || options === void 0 ? void 0 : options.includeValues) != null) {
                            formData.append('include_values', String(options.includeValues));
                        }
                        return [4 /*yield*/, fetch(url, {
                                method: "POST",
                                headers: headers,
                                body: formData,
                            })];
                    case 1:
                        response = _a.sent();
                        return [4 /*yield*/, this.handleResponse(response)];
                    case 2:
                        responseData = _a.sent();
                        return [2 /*return*/, (responseData.matches || [])];
                }
            });
        });
    };
    Collection.prototype.drop = function () {
        return __awaiter(this, void 0, void 0, function () {
            var url, headers, formData, response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        url = this.getCollectionUrl();
                        headers = this.getHeaders();
                        formData = new FormData();
                        return [4 /*yield*/, fetch(url, {
                                method: "DELETE",
                                headers: headers,
                                body: formData
                            })];
                    case 1:
                        response = _a.sent();
                        // 204 responses have no content, so we should just check status without parsing JSON
                        if (response.status === 204) {
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, this.handleResponse(response)];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    return Collection;
}());
exports.Collection = Collection;
