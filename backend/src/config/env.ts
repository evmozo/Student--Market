import dotenv from "dotenv";

dotenv.config();

const optional = (key: string, fallback = ""): string => process.env[key] ?? fallback;

const required = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
};

export const env = {
  port: Number(optional("PORT", "5000")),
  nodeEnv: optional("NODE_ENV", "development"),
  clientUrl: optional("CLIENT_URL", "http://localhost:5173"),
  mongoUri: required("MONGO_URI"),
  useMemoryMongo: optional("USE_MEMORY_MONGO", "false") === "true",
  seedDemoData: optional("SEED_DEMO_DATA", "false") === "true",
  jwtSecret: required("JWT_SECRET"),
  jwtExpiresIn: optional("JWT_EXPIRES_IN", "7d"),
  passwordResetMinutes: Number(optional("PASSWORD_RESET_MINUTES", "30")),
  smtpHost: optional("SMTP_HOST"),
  smtpPort: Number(optional("SMTP_PORT", "587")),
  smtpSecure: optional("SMTP_SECURE", "false") === "true",
  smtpUser: optional("SMTP_USER"),
  smtpPass: optional("SMTP_PASS"),
  emailFrom: optional("EMAIL_FROM", "Student Marketplace <no-reply@studentmarketplace.local>"),
  friendsOnlyMessaging: optional("FRIENDS_ONLY_MESSAGING", "false") === "true",
  supabaseUrl: optional("SUPABASE_URL"),
  supabaseServiceRoleKey: optional("SUPABASE_SERVICE_ROLE_KEY"),
  supabaseBucket: optional("SUPABASE_BUCKET", "student-marketplace")
};
