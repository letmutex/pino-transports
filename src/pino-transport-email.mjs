import build from "pino-abstract-transport";
import { prettyFactory } from "pino-pretty";
import nodemailer from "nodemailer";

export default async function (
  options = { smtpHost, smtpPort, smtpUser, smtpPass, sendTo }
) {
  const { smtpHost, smtpPort, smtpUser, smtpPass, sendTo } = options;
  const emailTransporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: true,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });

  /**
   * @type {Array<Promise>} Send tasks.
   */
  const tasks = [];

  return build(
    async (source) => {
      const pretty = prettyFactory({ colorize: false });
      // We use async iterator to read log lines.
      for await (let line of source) {
        const task = emailTransporter.sendMail({
          from: smtpUser,
          to: sendTo,
          subject: "SomeApp Logging Alert",
          text: `Your app has logged an alert:\n${pretty(line)}.`,
        });
        tasks.push(task);
      }
      return source;
    },
    {
      parse: "lines",
      async close() {
        // Wait for all send tasks to complete.
        await Promise.all(tasks);
      },
    }
  );
}
