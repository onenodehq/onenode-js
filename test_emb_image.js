"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var embImage_1 = require("./src/embJson/embImage");
// Import the EmbImage class from the compiled JavaScript
import { EmbImage } from './dist/esm/embJson/embImage.js';

// Test valid mime type with empty chunks
try {
    var img = new embImage_1.EmbImage('SGVsbG8gV29ybGQ=', [], null, null, 'image/png');
    console.log("Created EmbImage with mime_type: image/png");
    console.log(JSON.stringify(img.toJSON(), null, 2));
    // Verify chunks field is not included when empty
    if (img.toJSON()["@embImage"].chunks === undefined) {
        console.log("✅ Chunks field is correctly omitted when empty");
    } else {
        console.log("❌ Chunks field should be omitted when empty");
    }
}
catch (e) {
    console.error("Unexpected error: ".concat(e));
}
// Test invalid mime type
try {
    var img = new embImage_1.EmbImage('SGVsbG8gV29ybGQ=', [], null, null, 'image/invalid');
    console.log('This should not print');
}
catch (e) {
    console.log("Validation error (expected): ".concat(e.message));
}
// Test fromJSON without chunks
try {
    var jsonDict = {
        "data": "SGVsbG8gV29ybGQ=",
        "mime_type": "image/jpeg",
    };
    var img = embImage_1.EmbImage.fromJSON(jsonDict);
    console.log("Created EmbImage from JSON without chunks field");
    // Verify chunks field is not included when empty
    if (img.toJSON()["@embImage"].chunks === undefined) {
        console.log("✅ Chunks field is correctly omitted when empty");
    } else {
        console.log("❌ Chunks field should be omitted when empty");
    }
}
catch (e) {
    console.error("Error in fromJSON without chunks: ".concat(e.message));
}
