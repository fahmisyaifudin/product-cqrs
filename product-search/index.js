const functions = require("@google-cloud/functions-framework");
const axios = require("axios");
require("dotenv").config();

functions.http("helloHttp", async (req, res) => {
  const ELASTICSEARCH_HOST = process.env.ELASTICSEARCH_HOST;
  const ELASTICSEARCH_PORT = process.env.ELASTICSEARCH_PORT;
  const ELASTICSEARCH_TOKEN = process.env.ELASTICSEARCH_TOKEN;
  if (req.method == "GET") {
    const { name, from, size } = req.query;
    const data = {};
    if (from && size) {
      data["from"] = from;
      data["size"] = size;
    }
    if (name) {
      data["query"] = {
        match: {
          name: {
            query: name,
          },
        },
      };
    }
    const response = await axios.request({
      method: "POST",
      url: `http://${ELASTICSEARCH_HOST}:${ELASTICSEARCH_PORT}/products/_search`,
      headers: {
        Authorization: `Basic ${ELASTICSEARCH_TOKEN}`,
      },
      data,
    });
    res.status(200).json({
      data: response.data.hits.hits,
    });
  } else {
    res.sendStatus(405);
  }
});
