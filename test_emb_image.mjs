// Import the EmbImage class from the compiled JavaScript
import { EmbImage } from './dist/esm/embJson/embImage.js';

// Test valid mime type with empty chunks
try {
    const img = new EmbImage('SGVsbG8gV29ybGQ=', [], null, null, 'image/png');
    console.log(`Created EmbImage with mime_type: image/png`);
    console.log(JSON.stringify(img.toJSON(), null, 2));
    // Verify chunks field is not included when empty
    if (img.toJSON()["@embImage"].chunks === undefined) {
        console.log("✅ Chunks field is correctly omitted when empty");
    } else {
        console.log("❌ Chunks field should be omitted when empty");
    }
} catch (e) {
    console.error(`Unexpected error: ${e}`);
}

// Test valid mime type with non-empty chunks
try {
    const img = new EmbImage('SGVsbG8gV29ybGQ=', ["test chunk"], null, null, 'image/png');
    console.log(`Created EmbImage with mime_type: image/png and non-empty chunks`);
    console.log(JSON.stringify(img.toJSON(), null, 2));
    // Verify chunks field is included when non-empty
    if (img.toJSON()["@embImage"].chunks !== undefined) {
        console.log("✅ Chunks field is correctly included when non-empty");
    } else {
        console.log("❌ Chunks field should be included when non-empty");
    }
} catch (e) {
    console.error(`Unexpected error: ${e}`);
}

// Test fromJSON without chunks
try {
    const jsonDict = {
        "data": "SGVsbG8gV29ybGQ=",
        "mime_type": "image/jpeg",
    };
    const img = EmbImage.fromJSON(jsonDict);
    console.log(`Created EmbImage from JSON without chunks field`);
    // Verify chunks field is not included when empty
    if (img.toJSON()["@embImage"].chunks === undefined) {
        console.log("✅ Chunks field is correctly omitted when empty");
    } else {
        console.log("❌ Chunks field should be omitted when empty");
    }
} catch (e) {
    console.error(`Error in fromJSON without chunks: ${e.message}`);
}

// Test fromJSON with chunks
try {
    const jsonDict = {
        "data": "SGVsbG8gV29ybGQ=",
        "mime_type": "image/jpeg",
        "chunks": ["test chunk"],
    };
    const img = EmbImage.fromJSON(jsonDict);
    console.log(`Created EmbImage from JSON with chunks field`);
    // Verify chunks field is included when non-empty
    if (img.toJSON()["@embImage"].chunks !== undefined) {
        console.log("✅ Chunks field is correctly included when non-empty");
    } else {
        console.log("❌ Chunks field should be included when non-empty");
    }
} catch (e) {
    console.error(`Error in fromJSON with chunks: ${e.message}`);
} 