import pino from "pino";
import * as path from "path";
import "dotenv/config";

const logger = pino({
  transport: {
    targets: [
      {
        target: "pino-pretty",
        options: { destination: 1 },
      },
      {
        target: "./pino-transport-rotating-file.mjs",
        level: "warn",
        options: { dir: path.join(process.cwd(), "logs") },
      },
      {
        target: "./pino-transport-loki.mjs",
        level: "error",
        options: {
          baseUrl: process.env.LOKI_BASE_URL,
          username: process.env.LOKI_AUTH_USERNAME,
          apiToken: process.env.LOKI_AUTH_PASSWORD,
        },
      },
      {
        target: "./pino-transport-email.mjs",
        level: "fatal",
        options: {
          smtpHost: process.env.EMAIL_SMTP_HOST,
          smtpPort: parseInt(process.env.EMAIL_SMTP_PORT),
          smtpUser: process.env.EMAIL_SMTP_USER,
          smtpPass: process.env.EMAIL_SMTP_PASS,
          sendTo: process.env.EMAIL_SEND_TO,
        },
      },
    ],
  },
});

// >> stdout
logger.info("I'm good.");
// >> stdout and file
logger.warn("Something may not be right.");
// >> stdout, file and loki
logger.error("Something goes wrong.");
// >> every transport will receive this log
logger.fatal("Something really bad just happened.");
