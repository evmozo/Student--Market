import mongoose from "mongoose";
import { env } from "./env";

type MemoryServer = { getUri(): string };
type MongoMemoryServerModule = {
  MongoMemoryServer: {
    create(options: { instance: { dbName: string } }): Promise<MemoryServer>;
  };
};

let memoryServer: MemoryServer | undefined;

export const connectDB = async (): Promise<void> => {
  mongoose.set("strictQuery", true);
  const uri = env.useMemoryMongo ? await startMemoryMongo() : env.mongoUri;
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 });
  console.log("MongoDB connected");
};

const startMemoryMongo = async (): Promise<string> => {
  const moduleName = "mongodb-memory-server";
  const { MongoMemoryServer } = (await import(moduleName)) as MongoMemoryServerModule;
  const server = await MongoMemoryServer.create({
    instance: { dbName: "student_marketplace" }
  });
  memoryServer = server;
  const uri = server.getUri();
  console.log("Using in-memory MongoDB for local development");
  return uri;
};
