"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OneNode = void 0;
var Database_1 = require("./Database");
var bson_1 = require("bson");
var fs = require("fs");
var OneNode = /** @class */ (function () {
    function OneNode() {
        this.projectId = process.env.ONENODE_PROJECT_ID || "";
        this.apiKey = process.env.ONENODE_API_KEY || "";
        this.isAnonymous = false;
        // If no API key provided, enter anonymous mode
        if (!this.apiKey) {
            this.isAnonymous = true;
            // Generate or load anonymous project ID
            this.projectId = this.getOrCreateAnonymousProjectId();
        }
        else {
            // Authenticated mode - require project ID
            if (!this.projectId) {
                throw new Error("Missing Project ID: Please provide the Project ID as an argument or set it in the ONENODE_PROJECT_ID environment variable. " +
                    "Tip: Ensure your environment file (e.g., .env) is loaded.");
            }
        }
    }
    OneNode.prototype.getOrCreateAnonymousProjectId = function () {
        var anonFilePath = ".onenode";
        // Try to load existing project ID
        if (fs.existsSync(anonFilePath)) {
            try {
                var projectId = fs.readFileSync(anonFilePath, 'utf8').trim();
                // Validate that it's a valid ObjectId format
                new bson_1.ObjectId(projectId);
                return projectId;
            }
            catch (error) {
                // File exists but is invalid, will create new one
            }
        }
        // Generate new project ID
        var newProjectId = new bson_1.ObjectId().toString();
        // Save to file
        try {
            fs.writeFileSync(anonFilePath, newProjectId);
        }
        catch (error) {
            // If we can't write the file, just use the generated ID without persistence
        }
        return newProjectId;
    };
    OneNode.prototype.db = function (dbName) {
        return new Database_1.Database(this.apiKey, this.projectId, dbName, this.isAnonymous);
    };
    return OneNode;
}());
exports.OneNode = OneNode;
