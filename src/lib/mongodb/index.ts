// lib/mongodb/index.ts
import { MongoClient, ClientSession } from "mongodb";

declare global {
  var _mongoClientPromise: Promise<MongoClient>;
}

const uri = process.env.MONGODB_URI;
if (!uri) {
  throw new Error("Please define the MONGODB_URI environment variable");
}

const options = {
  maxPoolSize: 10,
  connectTimeoutMS: 5000,
  serverSelectionTimeoutMS: 5000,
};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === "development") {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export async function getDb() {
  const client = await clientPromise;
  return client.db();
}

// New function to get client for sessions
export async function getClient() {
  return await clientPromise;
}

// Helper for transactions
export async function withTransaction<T>(
  callback: (session: ClientSession) => Promise<T>
): Promise<T> {
  const client = await getClient();
  const session = client.startSession();

  try {
    let result: T;

    await session.withTransaction(async () => {
      result = await callback(session);
    });

    return result!;
  } finally {
    await session.endSession();
  }
}
