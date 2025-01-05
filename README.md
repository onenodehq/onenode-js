# CapybaraDB

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
- [EmbJSON Data](#embjson-data)
- [License](#license)
- [Contact](#contact)

---

## Features

- **NoSQL + Vector + Object Storage** in one platform.  
- **No External Embedding Steps** — Just insert text with `EmbText`, CapybaraDB does the rest!  
- **Built-in Semantic Search** — Perform similarity-based queries without external services.  
- **Production-Ready** — Securely store your API key using environment variables.  

## Installation

```bash
npm install capybaradb
```

> **Note:** For local development, you can store your key in a `.env` file or assign it to a variable directly. Avoid hardcoding credentials in production.

---

## Quick Start

### Sign Up and Get Credentials

1. **Sign Up** at [CapybaraDB](https://capybaradb.co).  
2. Retrieve your **API Key** and **Project ID** from the developer console.  
3. **Store these securely** (e.g., in environment variables).

### Initialize Client

```typescript
import { CapybaraDB, EmbText } from "capybaradb";
import dotenv from "dotenv";

// For local dev: load .env variables
dotenv.config();

const client = new CapybaraDB({
  apiKey: process.env.CAPYBARA_API_KEY as string,
  projectId: process.env.CAPYBARA_PROJECT_ID as string,
});

const db = client.db("my_database");
const collection = db.collection("my_collection");
```

---

### Insert Documents (No Embedding Required!)

```typescript
import { CapybaraDB, EmbText } from "capybaradb";

async function main() {
  // Create a new CapybaraDB client (assumes you have an .env file with credentials)
  const client = new CapybaraDB();
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

---

### Query Documents (Semantic Search)

```typescript
import { CapybaraDB } from "capybaradb";

async function main() {
  const client = new CapybaraDB();
  const db = client.db("my_database");
  const collection = db.collection("my_collection");

  // Simple text query
  const userQuery = "Alice in a fantastical world";

  // Perform semantic search
  const response = await collection.query(userQuery);
  console.log("Query matches:", response.matches);
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

## EmbJSON Data

CapybaraDB extends JSON with AI-friendly data types like `EmbText`, making text embeddings and indexing automatic.  
No need for a separate vector DB or embedding service — CapybaraDB handles chunking, embedding, and indexing asynchronously.

**Supported Models** (example):
- `text-embedding-3-small`
- `text-embedding-3-large`
- `ada v2`  
*(More models coming soon!)*

---

## License

[MIT](LICENSE) © 2025 CapybaraDB

---

## Contact

- **Questions?** [Email us](mailto:hello@capybaradb.co)  
- **Website:** [capybaradb.co](https://capybaradb.co)

Happy hacking with CapybaraDB!
