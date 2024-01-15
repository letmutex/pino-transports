import build from "pino-abstract-transport";

export default async function (options = { baseUrl, username, apiToken }) {
  /**
   * @type {Array<Promise>} Send tasks.
   */
  const tasks = [];

  return build(
    async (source) => {
      // We use async iterator to read log lines.
      for await (let line of source) {
        const task = sendToLoki(
          options.baseUrl,
          options.username,
          options.apiToken,
          line
        );
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

function sendToLoki(baseUrl, username, apiToken, line) {
  const logData = JSON.parse(line);
  const logItems = [[(logData.time * 1000000).toString(), logData.msg]];
  const body = {
    streams: [
      {
        stream: {
          label: "testing",
        },
        values: logItems,
      },
    ],
  };
  return fetch(baseUrl + "/loki/api/v1/push", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization:
        "Basic " + Buffer.from(username + ":" + apiToken).toString("base64"),
    },
    body: JSON.stringify(body),
  });
}
