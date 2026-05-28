import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "crypto";
import { env } from "../config/env";
import { AppError } from "../utils/http";

const getClient = () => {
  const hasPlaceholderConfig =
    env.supabaseUrl.includes("your-project") || env.supabaseServiceRoleKey === "your_service_role_key";

  if (!env.supabaseUrl || !env.supabaseServiceRoleKey || hasPlaceholderConfig) {
    throw new AppError("Supabase storage is not configured", 500);
  }
  return createClient(env.supabaseUrl, env.supabaseServiceRoleKey);
};

const safeName = (name: string): string => name.toLowerCase().replace(/[^a-z0-9._-]/g, "-");
let publicBucketReady = false;

const ensurePublicBucket = async (client: ReturnType<typeof getClient>): Promise<void> => {
  if (publicBucketReady) return;

  const { data: bucket, error: getError } = await client.storage.getBucket(env.supabaseBucket);
  if (getError) {
    throw new AppError(`Supabase bucket unavailable: ${getError.message}`, 502);
  }

  if (bucket.public) {
    publicBucketReady = true;
    return;
  }

  const { error: updateError } = await client.storage.updateBucket(env.supabaseBucket, { public: true });
  if (updateError) {
    throw new AppError(`Supabase bucket must be public for shared media: ${updateError.message}`, 502);
  }
  publicBucketReady = true;
};

export const uploadBufferToSupabase = async (
  file: Express.Multer.File,
  folder: string
): Promise<string> => {
  const client = getClient();
  await ensurePublicBucket(client);
  const path = `${folder}/${Date.now()}-${randomUUID()}-${safeName(file.originalname)}`;
  const { error } = await client.storage.from(env.supabaseBucket).upload(path, file.buffer, {
    cacheControl: "31536000",
    contentType: file.mimetype,
    upsert: false
  });

  if (error) {
    throw new AppError(error.message, 502);
  }

  const { data } = client.storage.from(env.supabaseBucket).getPublicUrl(path);
  return data.publicUrl;
};
