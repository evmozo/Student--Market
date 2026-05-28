import mongoose from "mongoose";
import { connectDB } from "../config/db";
import { User } from "../models/User";

const run = async (): Promise<void> => {
  const email = process.argv[2]?.trim().toLowerCase();
  if (!email) {
    throw new Error("Usage: npm run admin:promote -- student@email.com");
  }

  await connectDB();
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error(`User not found: ${email}`);
  }

  user.role = "admin";
  user.accountStatus = "active";
  user.verificationStatus = "verified";
  user.verificationReviewedAt = new Date();
  user.verificationRejectionReason = undefined;
  await user.save({ validateBeforeSave: false });

  console.log(`${user.email} is now an active verified admin.`);
};

run()
  .catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : "Failed to promote admin");
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
