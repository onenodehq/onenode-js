import { EmbImage } from "./src/embJson/embImage";

// Test valid mime type
try {
    const img = new EmbImage('SGVsbG8gV29ybGQ=', [], null, null, 'image/png');
    console.log(`Created EmbImage with mime_type: image/png`);
    console.log(JSON.stringify(img.toJSON(), null, 2));
} catch (e) {
    console.error(`Unexpected error: ${e}`);
}

// Test invalid mime type
try {
    const img = new EmbImage('SGVsbG8gV29ybGQ=', [], null, null, 'image/invalid');
    console.log('This should not print');
} catch (e) {
    console.log(`Validation error (expected): ${e.message}`);
}

// Test fromJSON
try {
    const jsonDict = {
        "data": "SGVsbG8gV29ybGQ=",
        "mime_type": "image/jpeg",
        "chunks": ["test chunk"],
    };
    const img = EmbImage.fromJSON(jsonDict);
    console.log(`Created EmbImage from JSON with mime_type: image/jpeg`);
    console.log(`Chunks: ${JSON.stringify(img.toJSON()["@embImage"].chunks)}`);
} catch (e) {
    console.error(`Error in fromJSON: ${e.message}`);
} 