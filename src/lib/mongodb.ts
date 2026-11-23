import mongoose from "mongoose";

interface MongooseCache {
  connection: typeof mongoose | null;
  promise: Promise<typeof mongoose | null> | null;
}

declare global {
  var mongooseCache: MongooseCache | undefined;
}

const cache = (globalThis.mongooseCache ??= {
  connection: null,
  promise: null,
});

let lastError: string | null = null;
let lastConnected = false;

mongoose.connection.on("connected", () => {
  console.log("[mongodb]connected to MongoDB");
  lastConnected = true;
  lastError = null;
});

mongoose.connection.on("error", (err) => {
  console.error("[mongodb] MongoDB connection error:", err.message);
  lastConnected = false;
  lastError = err.message;
});

mongoose.connection.on("disconnected", () => {
  console.log("[mongodb] MongoDB disconnected");
  lastConnected = false;
});

export function getDbStatus(): { connected: boolean; error: string | null } {
  const ready = cache.connection?.connection.readyState;
  return {
    connected: ready === 1 || lastConnected,
    error: lastError,
  };
}

export async function connectToDatabase(): Promise<{
  mongoose: typeof mongoose | null;
  connected: boolean;
  error: string | null;
}> {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    lastError = "MONGODB_URI is not set. Add it to your local .env file.";
    lastConnected = false;
    return { mongoose: null, connected: false, error: lastError };
  }

  if (cache.connection?.connection.readyState === 1) {
    console.log("[mongodb] using cached MongoDB connection");
    return { mongoose: cache.connection, connected: true, error: null };
  }

  if (!cache.promise) {
    console.log("[mongodb] connecting to MongoDB...");
    cache.promise = mongoose
      .connect(uri, { serverSelectionTimeoutMS: 8000 })
      .then((conn) => {
        cache.connection = conn;
        lastConnected = true;
        lastError = null;
        console.log("[mongodb] MongoDB connection established");
        return conn;
      })
      .catch((error: unknown) => {
        cache.promise = null;
        lastConnected = false;
        lastError = (error as Error).message;
        console.error("[mongodb] failed to connect to MongoDB:", lastError);
        return null;
      });
  }

  const conn = await cache.promise;
  if (conn) {
    return { mongoose: conn, connected: true, error: null };
  }
  return { mongoose: null, connected: false, error: lastError };
}
