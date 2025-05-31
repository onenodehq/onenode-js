# OneNode-JS Fluent Builder Syntax Usage Examples

This document provides practical examples of how to use the new fluent builder syntax in the onenode-js library.

## Installation and Import

```bash
npm install onenode
```

```typescript
// TypeScript/ES6 modules
import { Text, Image, EmbModels, VisionModels } from 'onenode';
import type { TextIndexOptions, ImageIndexOptions } from 'onenode';

// CommonJS
const { Text, Image, EmbModels, VisionModels } = require('onenode');
```

## Text Usage Examples

### 1. Basic Text Creation (No Indexing)

```typescript
// Create text without indexing - just store the content
const simpleText = new Text("This is just plain text content");

console.log(simpleText.toString()); // Text("This is just plain text content")
console.log(simpleText.toJSON());
// Output:
// {
//   "xText": {
//     "text": "This is just plain text content",
//     "chunks": [],
//     "index": false
//   }
// }
```

### 2. Text with Default Indexing

```typescript
// Enable indexing with server defaults
const indexedText = new Text("This text will be indexed and searchable").index();

console.log(indexedText.toJSON());
// Output:
// {
//   "xText": {
//     "text": "This text will be indexed and searchable",
//     "chunks": [],
//     "index": true
//   }
// }
```

### 3. Text with Custom Indexing Options

```typescript
// Full customization with all options
const customText = new Text("Long document that needs custom chunking strategy")
  .index({
    embModel: EmbModels.TEXT_EMBEDDING_3_LARGE,
    maxChunkSize: 500,
    chunkOverlap: 100,
    isSeparatorRegex: true,
    separators: ["\n\n", "\n", "\\.", "\\!", "\\?"],
    keepSeparator: false
  });

console.log(customText.toJSON());
// Output includes all specified options
```

### 4. Partial Custom Options

```typescript
// Only specify the options you want to customize
const partialCustomText = new Text("Document with custom embedding model")
  .index({
    embModel: EmbModels.TEXT_EMBEDDING_3_LARGE,
    maxChunkSize: 300
    // Other options will use server defaults
  });
```

## Image Usage Examples

### 1. Basic Image Creation (No Indexing)

```typescript
// Create image without indexing - just store the binary data
const base64Image = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChAGAWaePvQAAAABJRU5ErkJggg==";
const simpleImage = new Image(base64Image, "image/png");

console.log(simpleImage.toString()); // Image(<raw data>)
console.log(simpleImage.toJSON());
// Output:
// {
//   "xImage": {
//     "data": "iVBORw0KGgo...",
//     "mime_type": "image/png",
//     "index": false
//   }
// }
```

### 2. Image with Default Indexing

```typescript
// Enable indexing with server defaults
const indexedImage = new Image(base64Image, "image/jpeg").index();

console.log(indexedImage.toJSON());
// Output:
// {
//   "xImage": {
//     "data": "...",
//     "mime_type": "image/jpeg",
//     "index": true
//   }
// }
```

### 3. Image with Custom Vision and Embedding Models

```typescript
// Customize vision and embedding models
const customImage = new Image(base64Image, "image/png")
  .index({
    visionModel: VisionModels.GPT_4O,
    embModel: EmbModels.TEXT_EMBEDDING_3_LARGE,
    maxChunkSize: 600,
    chunkOverlap: 50
  });

console.log(customImage.toJSON());
// Output includes specified vision_model, emb_model, etc.
```

## Real-World Usage Scenarios

### Scenario 1: Document Processing Pipeline

```typescript
import { OneNode, Text, EmbModels } from 'onenode';

class DocumentProcessor {
  private client: OneNode;
  
  constructor(apiKey: string) {
    this.client = new OneNode(apiKey);
  }
  
  async processDocuments(documents: string[]) {
    const db = this.client.database("document_db");
    const collection = db.collection("processed_docs");
    
    for (const doc of documents) {
      // Create text with custom chunking for better search
      const processedText = new Text(doc).index({
        embModel: EmbModels.TEXT_EMBEDDING_3_LARGE,
        maxChunkSize: 400,
        chunkOverlap: 80,
        separators: ["\n\n", "\n", ". ", "! ", "? "]
      });
      
      await collection.insertOne({
        content: processedText,
        timestamp: new Date(),
        processed: true
      });
    }
  }
}
```

### Scenario 2: Image Gallery with Search

```typescript
import { OneNode, Image, VisionModels, EmbModels } from 'onenode';

class ImageGallery {
  private client: OneNode;
  
  constructor(apiKey: string) {
    this.client = new OneNode(apiKey);
  }
  
  async uploadImage(imageData: string, mimeType: string, enableSearch: boolean = true) {
    const db = this.client.database("gallery_db");
    const collection = db.collection("images");
    
    let imageObj: Image;
    
    if (enableSearch) {
      // Enable indexing for searchable images
      imageObj = new Image(imageData, mimeType).index({
        visionModel: VisionModels.GPT_4O_MINI,
        embModel: EmbModels.TEXT_EMBEDDING_3_SMALL
      });
    } else {
      // Just store without indexing for basic gallery
      imageObj = new Image(imageData, mimeType);
    }
    
    return await collection.insertOne({
      image: imageObj,
      uploadDate: new Date(),
      searchable: enableSearch
    });
  }
}
```

### Scenario 3: Content Management System

```typescript
import { OneNode, Text, Image, type TextIndexOptions, type ImageIndexOptions } from 'onenode';

interface ContentConfig {
  textOptions?: TextIndexOptions;
  imageOptions?: ImageIndexOptions;
}

class ContentManager {
  private client: OneNode;
  
  constructor(apiKey: string) {
    this.client = new OneNode(apiKey);
  }
  
  async createArticle(
    title: string, 
    content: string, 
    images: Array<{data: string, mimeType: string}>,
    config: ContentConfig = {}
  ) {
    const db = this.client.database("cms_db");
    const collection = db.collection("articles");
    
    // Process title - always indexed for search
    const titleText = new Text(title).index({
      embModel: EmbModels.TEXT_EMBEDDING_3_SMALL,
      ...config.textOptions
    });
    
    // Process content - use custom config if provided
    const contentText = new Text(content).index(config.textOptions || {});
    
    // Process images
    const processedImages = images.map(img => 
      new Image(img.data, img.mimeType).index(config.imageOptions || {})
    );
    
    return await collection.insertOne({
      title: titleText,
      content: contentText,
      images: processedImages,
      createdAt: new Date()
    });
  }
  
  async createSimplePost(content: string) {
    // Simple post without indexing - just storage
    const db = this.client.database("cms_db");
    const collection = db.collection("simple_posts");
    
    const simpleContent = new Text(content); // No .index() call
    
    return await collection.insertOne({
      content: simpleContent,
      createdAt: new Date()
    });
  }
}
```

### Scenario 4: Migration from Old API

```typescript
// OLD API usage (before fluent builder)
function oldWay() {
  // This would have been the old constructor with many parameters
  const oldText = new Text(
    "content",
    [], // chunks
    EmbModels.TEXT_EMBEDDING_3_SMALL, // embModel
    200, // maxChunkSize
    20,  // chunkOverlap
    false, // isSeparatorRegex
    null,  // separators
    false  // keepSeparator
  );
}

// NEW API usage (fluent builder)
function newWay() {
  const newText = new Text("content").index({
    embModel: EmbModels.TEXT_EMBEDDING_3_SMALL,
    maxChunkSize: 200,
    chunkOverlap: 20,
    isSeparatorRegex: false,
    separators: null,
    keepSeparator: false
  });
}
```

## Key Benefits in Practice

### 1. Clear Intent
```typescript
// It's obvious this text will be indexed
const searchableText = new Text("Important document").index();

// It's obvious this text is just for storage
const storageText = new Text("Temporary note");
```

### 2. Flexible Configuration
```typescript
// Only specify what you need to customize
const text1 = new Text("Doc 1").index({ embModel: EmbModels.TEXT_EMBEDDING_3_LARGE });
const text2 = new Text("Doc 2").index({ maxChunkSize: 500 });
const text3 = new Text("Doc 3").index(); // All defaults
```

### 3. Type Safety (TypeScript)
```typescript
// TypeScript will validate your options
const text = new Text("content").index({
  embModel: "invalid-model", // ❌ TypeScript error
  maxChunkSize: "not-a-number" // ❌ TypeScript error
});
```

### 4. Method Chaining
```typescript
// Fluent interface allows for clean chaining
const processedContent = new Text(rawContent)
  .index({
    embModel: EmbModels.TEXT_EMBEDDING_3_LARGE,
    maxChunkSize: 400
  });
```

## Available Models

```typescript
// Embedding Models
EmbModels.TEXT_EMBEDDING_3_SMALL
EmbModels.TEXT_EMBEDDING_3_LARGE
EmbModels.TEXT_EMBEDDING_ADA_002

// Vision Models
VisionModels.GPT_4O_MINI
VisionModels.GPT_4O
VisionModels.GPT_4_TURBO
VisionModels.O1
``` 