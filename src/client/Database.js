"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Database = void 0;
var Collection_1 = require("./Collection");
var Database = /** @class */ (function () {
    function Database(apiKey, projectId, dbName, isAnonymous) {
        if (isAnonymous === void 0) { isAnonymous = false; }
        this.apiKey = apiKey;
        this.projectId = projectId;
        this.dbName = dbName;
        this.isAnonymous = isAnonymous;
    }
    Database.prototype.collection = function (collectionName) {
        return new Collection_1.Collection(this.apiKey, this.projectId, this.dbName, collectionName, this.isAnonymous);
    };
    return Database;
}());
exports.Database = Database;
