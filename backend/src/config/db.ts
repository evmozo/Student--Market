import mongoose from "mongoose";
import { env } from "./env";

let memoryServer: { getUri(): string } | undefined;

export const connectDB = async (): Promise<void> => {
  mongoose.set("strictQuery", true);
  const uri = env.useMemoryMongo ? await startMemoryMongo() : env.mongoUri;
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 });
  console.log("MongoDB connected");
};

const startMemoryMongo = async (): Promise<string> => {
  const { MongoMemoryServer } = await import("mongodb-memory-server");
  memoryServer = await MongoMemoryServer.create({
    instance: { dbName: "student_marketplace" }
  });
  const uri = memoryServer.getUri();
  console.log("Using in-memory MongoDB for local development");
  return uri;
};
