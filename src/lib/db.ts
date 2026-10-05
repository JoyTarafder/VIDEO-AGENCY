import mongoose from "mongoose";

/**
 * Cached Mongoose connection (the standard dev/prod pattern — prevents
 * opening a new socket on every serverless invocation during a burst).
 *
 * When MONGODB_URI is unset the API routes degrade gracefully: submissions
 * are validated, logged server-side and acknowledged, so the site never
 * hard-fails before the database is wired up. Configure a real URI for production.
 */
const MONGODB_URI = process.env.MONGODB_URI;

type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

const globalForMongoose = globalThis as unknown as { mongooseCache?: MongooseCache };
const cache: MongooseCache = (globalForMongoose.mongooseCache ??= { conn: null, promise: null });

export function isDbConfigured() {
  return Boolean(MONGODB_URI);
}

export async function connectToDatabase() {
  if (!MONGODB_URI) return null;
  if (cache.conn) return cache.conn;
  if (!cache.promise) {
    cache.promise = mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5_000,
      connectTimeoutMS: 5_000,
    });
  }
  try {
    cache.conn = await cache.promise;
  } catch (err) {
    cache.promise = null;
    console.error("[db] MongoDB connection failed:", err);
    return null;
  }
  return cache.conn;
}
