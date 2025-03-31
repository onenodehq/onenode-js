# CapyDB JavaScript SDK

> The chillest AI-native database, built for JavaScript/TypeScript.  
> **Store documents, vectors, and more — all in one place, with no need for extra vector DBs.**

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Quick Start](#quick-start)
  - [Sign Up and Get Credentials](#sign-up-and-get-credentials)
  - [Initialize Client](#initialize-client)
  - [Insert Documents (No Embedding Required!)](#insert-documents-no-embedding-required)
  - [Query Documents (Semantic Search)](#query-documents-semantic-search)
- [EmbJSON Data Types](#embjson-data-types)
  - [EmbText](#embtext)
    - [Basic Usage](#basic-usage)
    - [Customized Usage](#customized-usage)
    - [Parameter Reference](#parameter-reference)
    - [How It Works](#how-it-works)
    - [Accessing Generated Chunks](#accessing-generated-chunks)
    - [Usage in Nested Fields](#usage-in-nested-fields)
  - [EmbImage](#embimage)
    - [Basic Usage](#basic-usage-1)
    - [Customized Usage](#customized-usage-1)
    - [Parameter Reference](#parameter-reference-1)
    - [How It Works](#how-it-works-1)
    - [Querying Images](#querying-images)
- [Supported Embedding Models](#supported-embedding-models)
- [License](#license)
- [Contact](#contact)

---

## Features

- **NoSQL + Vector + Object Storage** in one platform.  
- **No External Embedding Steps** — Just insert text with `EmbText`, CapyDB does the rest!  
- **Built-in Semantic Search** — Perform similarity-based queries without external services.  
- **Production-Ready** — Securely store your API key using environment variables.  

## Installation

```bash
npm install capydb
```

> **Note:** For local development, you can store your key in a `.env` file or assign it to a variable directly. Avoid hardcoding credentials in production.

---

## Quick Start

### Sign Up and Get Credentials

1. **Sign Up** at [CapyDB](https://capydb.com).  
2. Retrieve your **API Key** and **Project ID** from the developer console.  
3. **Store these securely** (e.g., in environment variables).

### Initialize Client

```typescript
import { CapyDB, EmbText } from "capydb";
import dotenv from "dotenv";

// For local dev: load .env variables
dotenv.config();

const client = new CapyDB({
  apiKey: process.env.CAPYDB_API_KEY as string,
  projectId: process.env.CAPYDB_PROJECT_ID as string,
});

const db = client.db("my_database");
const collection = db.collection("my_collection");
```

---

### Insert Documents (No Embedding Required!)

```typescript
import { CapyDB, EmbText } from "capydb";

async function main() {
  // Create a new CapyDB client (assumes you have an .env file with credentials)
  const client = new CapyDB();
  const db = client.db("my_database");
  const collection = db.collection("my_collection");

  // Define the document to be inserted
  const doc = {
    name: "Alice",
    age: "7",
    background: new EmbText(
      "Through the Looking-Glass follows Alice as she steps into a fantastical world..."
    ),
  };

  // Insert the document
  const result = await collection.insert(doc);
  console.log("Insert result:", result);
}

main();
```

**What Happens Under the Hood?**  
- Text fields wrapped as `EmbText` are automatically chunked and embedded.  
- The resulting vectors are indexed for semantic queries.
- All processing happens asynchronously in the background.

---

### Query Documents (Semantic Search)

```typescript
import { CapyDB } from "capydb";

async function main() {
  const client = new CapyDB();
  const db = client.db("my_database");
  const collection = db.collection("my_collection");

  // Simple text query
  const userQuery = "What is the capital of France?";
  const filter = {category: "geography"}; // Optional
  const projection = {mode: "include", fields: ["title", "content"]}; // Optional

  // Perform semantic search
  const response = await collection.query(userQuery, filter, projection);
  console.log("Query matches:", response.matches);
  
  // Access the first match
  if (response.matches.length > 0) {
    const match = response.matches[0];
    console.log(`Matched chunk: ${match.chunk}`);
    console.log(`Field path: ${match.path}`);
    console.log(`Similarity score: ${match.score}`);
    console.log(`Document ID: ${match.document._id}`);
  }
}

main();
```

**Example Response**:

```json
{
  "matches": [
    {
      "chunk": "Through the Looking-Glass follows Alice...",
      "path": "background",
      "score": 0.703643203,
      "document": {
        "_id": "ObjectId('671bf91580bffb6387b4f3d2')"
      }
    }
  ]
}
```

---

## EmbJSON Data Types

CapyDB extends JSON with AI-friendly data types like `EmbText`, making text embeddings and indexing automatic.  
No need for a separate vector DB or embedding service — CapyDB handles chunking, embedding, and indexing asynchronously.

### EmbText

`EmbText` is a specialized data type for storing and embedding text in CapyDB. It enables semantic search capabilities by automatically chunking, embedding, and indexing text.

When stored in the database, the text is processed asynchronously in the background:
1. The text is chunked based on the specified parameters
2. Each chunk is embedded using the specified embedding model
3. The embeddings are indexed for efficient semantic search

#### Basic Usage

Below is the simplest way to use `EmbText`:

```typescript
import { EmbText } from "capydb";

// Storing a single text field that you want to embed
const document = {
  field_name: new EmbText("Alice is a data scientist with expertise in AI and machine learning. She has led several projects in natural language processing.")
};
```

This snippet creates an `EmbText` object containing the text. By default, it uses the `text-embedding-3-small` model and sensible defaults for chunking and overlap.

#### Customized Usage

If you have specific requirements (e.g., a different embedding model or particular chunking strategy), customize `EmbText` by specifying additional parameters:

```typescript
import { EmbText, EmbModels } from "capydb";

const document = {
  field_name: new EmbText(
    "Alice is a data scientist with expertise in AI and machine learning. She has led several projects in natural language processing.",
    [], // chunks - leave empty, will be populated by the database
    EmbModels.TEXT_EMBEDDING_3_LARGE, // Change the default model
    200, // maxChunkSize - Configure chunk sizes
    20,  // chunkOverlap - Overlap between chunks
    false, // isSeparatorRegex - Are separators plain strings or regex?
    ["\n\n", "\n"], // separators - List of separator strings
    false // keepSeparator - Keep or remove the separator in chunks
  )
};
```

For better readability, you can also use named parameters with an object:

```typescript
import { EmbText, EmbModels } from "capydb";

const document = {
  field_name: new EmbText({
    text: "Alice is a data scientist with expertise in AI and machine learning. She has led several projects in natural language processing.",
    chunks: [], // leave empty, will be populated by the database
    embModel: EmbModels.TEXT_EMBEDDING_3_LARGE,
    maxChunkSize: 200,
    chunkOverlap: 20,
    isSeparatorRegex: false,
    separators: ["\n\n", "\n"],
    keepSeparator: false
  })
};
```

#### Parameter Reference

| **Parameter**      | **Description**                                                                                                                                   |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| **text**           | The core content for `EmbText`. This text is automatically chunked and embedded for semantic search.                                              |
| **chunks**         | **Auto-generated by the database** after the text is processed. It is **not** set by the user, and is available only after embedding completes.   |
| **embModel**       | Which embedding model to use. Defaults to `TEXT_EMBEDDING_3_SMALL`. You can choose from other supported models, such as `TEXT_EMBEDDING_3_LARGE`. |
| **maxChunkSize**   | Maximum character length of each chunk. Larger chunks reduce the total chunk count but may reduce search efficiency (due to bigger embeddings).   |
| **chunkOverlap**   | Overlapping character count between consecutive chunks, useful for preserving context at chunk boundaries.                                        |
| **isSeparatorRegex** | Whether to treat each separator in `separators` as a regular expression. Defaults to `false`.                                                   |
| **separators**     | A list of separator strings (or regex patterns) used to split the text. For instance, `["\n\n", "\n"]` can split paragraphs or single lines.      |
| **keepSeparator**  | If `true`, separators remain in the chunked text. If `false`, they are stripped out.                                                              |

#### How It Works

Whenever you insert a document containing `EmbText` into CapyDB, three main steps happen **asynchronously**:

1. **Chunking**  
   The text is divided into chunks based on `maxChunkSize`, `chunkOverlap`, and any specified `separators`. This ensures the text is broken down into optimally sized segments.

2. **Embedding**  
   Each chunk is transformed into a vector representation using the specified `embModel`. This step captures the semantic essence of the text.

3. **Indexing**  
   The embeddings are indexed for efficient semantic search. Because these steps occur in the background, you get immediate responses to your write operations, but actual query availability may lag slightly behind the write.

#### Accessing Generated Chunks

The `chunks` property is **auto-populated** by the database after the text finishes embedding and indexing. For instance:

```typescript
// Assume this EmbText has been inserted and processed
const embText = document.field_name;

console.log(embText.text);
// "Alice is a data scientist with expertise in AI and machine learning. She has led several projects in natural language processing."

console.log(embText.chunks);
// [
//   "Alice is a data scientist",
//   "with expertise in AI",
//   "and machine learning.",
//   "She has led several projects",
//   "in natural language processing."
// ]
```

#### Usage in Nested Fields

`EmbText` can be embedded anywhere in your document, including nested objects:

```typescript
const document = {
  profile: {
    name: "Bob",
    bio: new EmbText(
      "Bob has over a decade of experience in AI, focusing on neural networks and deep learning."
    )
  }
};
```

### EmbImage

`EmbImage` is a specialized data type for storing and processing images in CapyDB. It enables multimodal capabilities by storing images that can be:

1. Processed by vision models to extract textual descriptions
2. Embedded for vector search (using the extracted descriptions)
3. Stored alongside other document data

When stored in the database, the image is processed asynchronously in the background:
- If a vision model is specified, the image is analyzed to generate textual descriptions
- If an embedding model is specified, these descriptions are embedded for semantic search
- The results are stored in the 'chunks' property

#### Basic Usage

Below is the simplest way to use `EmbImage`:

```typescript
import { EmbImage } from "capydb";
import fs from "fs";

// Read an image file and convert to base64
const imageBuffer = fs.readFileSync("path/to/image.jpg");
const base64Image = imageBuffer.toString("base64");

// Storing a single image field
const document = {
  title: "Product Image",
  image: new EmbImage(base64Image)
};
```

This snippet creates an `EmbImage` object containing your base64-encoded image data. By default, no specific models are set and all other parameters remain optional.

#### Customized Usage

If you have specific requirements (e.g., using a particular embedding or vision model), customize `EmbImage` by specifying additional parameters:

```typescript
import { EmbImage, EmbModels, VisionModels } from "capydb";
import fs from "fs";

// Read an image file and convert to base64
const imageBuffer = fs.readFileSync("path/to/image.jpg");
const base64Image = imageBuffer.toString("base64");

const document = {
  title: "Product Image",
  description: "Our latest product",
  image: new EmbImage(
    base64Image,                                  // Base64-encoded image
    [],                                           // Chunks (leave empty, populated by server)
    EmbModels.TEXT_EMBEDDING_3_SMALL,             // For embedding descriptions
    VisionModels.GPT_4O,                          // Vision model for analysis
    200,                                          // Max chunk size
    20,                                           // Chunk overlap
    false,                                        // Is separator regex
    ["\n\n", "\n"],                               // Separators for chunking
    false                                         // Keep separator
  )
};
```

For better readability, you can also use named parameters with an object:

```typescript
import { EmbImage, EmbModels, VisionModels } from "capydb";
import fs from "fs";

// Read an image file and convert to base64
const imageBuffer = fs.readFileSync("path/to/image.jpg");
const base64Image = imageBuffer.toString("base64");

const document = {
  title: "Product Image",
  description: "Our latest product",
  image: new EmbImage({
    data: base64Image,                            // Base64-encoded image
    chunks: [],                                   // Leave empty, populated by server
    embModel: EmbModels.TEXT_EMBEDDING_3_SMALL,   // For embedding descriptions
    visionModel: VisionModels.GPT_4O,             // Vision model for analysis
    maxChunkSize: 200,                            // Configure chunk sizes
    chunkOverlap: 20,                             // Overlap between chunks
    isSeparatorRegex: false,                      // Are separators plain strings or regex?
    separators: ["\n\n", "\n"],                   // Separators for chunking
    keepSeparator: false                          // Keep or remove separators
  })
};
```

#### Parameter Reference

| **Parameter**      | **Description**                                                                                                                                   |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| **data**           | The base64 encoded image data. This image is processed and embedded for semantic search.                                                          |
| **chunks**         | **Auto-generated by the database** after processing the image. It is **not** set by the user, and is available only after embedding completes.    |
| **embModel**       | Which embedding model to use for text chunks. Defaults to `null`. Supported models include `TEXT_EMBEDDING_3_SMALL`, `TEXT_EMBEDDING_3_LARGE`, and `TEXT_EMBEDDING_ADA_002`. |
| **visionModel**    | Which vision model to use for processing the image. Defaults to `null`. Supported models include `GPT_4O_MINI`, `GPT_4O`, `GPT_4O_TURBO`, and `GPT_O1`. |
| **maxChunkSize**   | Maximum character length for each text chunk. Used when processing vision model output.                                                           |
| **chunkOverlap**   | Overlapping character count between consecutive chunks, useful for preserving context at chunk boundaries.                                        |
| **isSeparatorRegex** | Whether to treat each separator in `separators` as a regular expression. Defaults to `false`.                                                   |
| **separators**     | A list of separator strings (or regex patterns) used during processing. While more common in text, these may also apply to image metadata or descriptions if present. |
| **keepSeparator**  | If `true`, separators remain in the processed data. If `false`, they are removed.                                                                 |

#### How It Works

Whenever you insert a document containing `EmbImage` into CapyDB, the following steps occur **asynchronously**:

1. **Data Validation and Decoding**  
   The base64 image data is validated (ensuring it's properly encoded) and decoded as needed.

2. **Vision Model Processing (if specified)**  
   If a vision model is specified, the image is analyzed to generate textual descriptions.

3. **Embedding (if specified)**  
   If an embedding model is specified, the textual descriptions are transformed into vector representations.

4. **Indexing**  
   The resulting embeddings are indexed for efficient semantic search. These steps happen in the background, so while write operations are fast, query availability may have a slight delay.

#### Querying Images

Once the embedding and indexing steps are complete, your `EmbImage` fields become searchable. To perform semantic queries on image data, use the standard query operations:

```typescript
import { CapyDB } from "capydb";

async function main() {
  // Initialize the client
  const client = new CapyDB();
  const collection = client.db("my_database").collection("my_collection");

  // Query for images with similar content
  const results = await collection.query("product with blue background");

  // Access the first match
  if (results.matches.length > 0) {
    const match = results.matches[0];
    console.log(`Matched chunk: ${match.chunk}`);
    console.log(`Field path: ${match.path}`);
    console.log(`Similarity score: ${match.score}`);
    console.log(`Document ID: ${match.document._id}`);
  }
}

main();
```

## Supported Embedding Models

CapyDB supports the following embedding models:

```typescript
import { EmbModels } from "capydb";

// Available models
EmbModels.TEXT_EMBEDDING_3_SMALL  // "text-embedding-3-small"
EmbModels.TEXT_EMBEDDING_3_LARGE  // "text-embedding-3-large"
EmbModels.TEXT_EMBEDDING_ADA_002  // "text-embedding-ada-002"
```

---

## License

[Apache 2.0](LICENSE) © 2025 CapyDB

---

## Contact

- **Questions?** [Email us](mailto:hello@capydb.com)  
- **Website:** [capydb.com](https://capydb.com)

Happy hacking with CapyDB!
