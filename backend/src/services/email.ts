import nodemailer from "nodemailer";
import { env } from "../config/env";
import { AppError } from "../utils/http";

const hasSmtpConfig = (): boolean => Boolean(env.smtpHost && env.smtpUser && env.smtpPass);

export const sendPasswordResetEmail = async (to: string, resetLink: string): Promise<void> => {
  if (!hasSmtpConfig()) {
    if (env.nodeEnv === "production") {
      throw new AppError("SMTP email is not configured", 500);
    }
    console.info(`Password reset link for ${to}: ${resetLink}`);
    return;
  }

  const transporter = nodemailer.createTransport({
    host: env.smtpHost,
    port: env.smtpPort,
    secure: env.smtpSecure,
    auth: {
      user: env.smtpUser,
      pass: env.smtpPass
    }
  });

  await transporter.sendMail({
    from: env.emailFrom,
    to,
    subject: "Reset your Student Marketplace password",
    text: `Reset your password: ${resetLink}\n\nThis link expires in ${env.passwordResetMinutes} minutes.`,
    html: `<p>Reset your password:</p><p><a href="${resetLink}">${resetLink}</a></p><p>This link expires in ${env.passwordResetMinutes} minutes.</p>`
  });
};
