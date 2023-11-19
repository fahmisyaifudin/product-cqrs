const functions = require("@google-cloud/functions-framework");
const axios = require("axios");
require("dotenv").config();

functions.cloudEvent("helloPubSub", async (cloudEvent) => {
  const ELASTICSEARCH_HOST = process.env.ELASTICSEARCH_HOST;
  const ELASTICSEARCH_PORT = process.env.ELASTICSEARCH_PORT;
  const ELASTICSEARCH_TOKEN = process.env.ELASTICSEARCH_TOKEN;

  const base64name = cloudEvent.data.message.data;
  const message = Buffer.from(base64name, "base64").toString();
  const { id, ...data } = JSON.parse(message);

  await axios.request({
    method: "POST",
    url: `http://${ELASTICSEARCH_HOST}:${ELASTICSEARCH_PORT}/products/_create/${id}`,
    headers: {
      Authorization: `Basic ${ELASTICSEARCH_TOKEN}`,
    },
    data,
  });
});
