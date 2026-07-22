import { MongoClient, Db } from "mongodb";

let client: MongoClient | null = null;
let clientPromise: Promise<MongoClient> | null = null;

function getMongoUri(): string | null {
  return process.env.MONGODB_URI || process.env.DATABASE_URL || null;
}

export async function getDb(): Promise<Db | null> {
  const uri = getMongoUri();
  if (!uri) {
    return null;
  }

  try {
    if (process.env.NODE_ENV === "development") {
      // Use a global variable so connection is preserved across HMR in dev
      const globalWithMongo = global as typeof globalThis & {
        _mongoClientPromise?: Promise<MongoClient>;
      };

      if (!globalWithMongo._mongoClientPromise) {
        client = new MongoClient(uri);
        globalWithMongo._mongoClientPromise = client.connect();
      }
      clientPromise = globalWithMongo._mongoClientPromise;
    } else {
      if (!clientPromise) {
        client = new MongoClient(uri);
        clientPromise = client.connect();
      }
    }

    const connectedClient = await clientPromise;
    return connectedClient.db("auren");
  } catch (error) {
    console.warn("[MongoDB] Connection warning (failing open for 100% uptime):", error);
    return null;
  }
}
