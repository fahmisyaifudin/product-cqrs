const functions = require("@google-cloud/functions-framework");
const { Client } = require("pg");
const Ajv = require("ajv");
const ajv = new Ajv();
const { PubSub } = require("@google-cloud/pubsub");

require("dotenv").config();

functions.http("helloHttp", async (req, res) => {
  const client = new Client({
    connectionString: process.env["DATABASE_URL"],
  });
  await client.connect();
  const pubSubClient = new PubSub();
  const topicNameOrId = process.env["TOPIC_ID"];
  if (req.method == "POST") {
    const validate = ajv.compile({
      type: "object",
      properties: {
        name: { type: "string" },
        price: { type: "integer" },
        quantity: { type: "integer" },
        description: { type: "string" },
      },
      required: ["name", "price", "quantity"],
      additionalProperties: false,
    });
    const valid = validate(req.body);
    if (!valid) res.status(400).json({ message: validate.errors });

    const product = await client.query(
      "INSERT INTO products (name, price, quantity, description) VALUES ($1, $2, $3, $4) RETURNING *",
      [req.body.name, req.body.price, req.body.quantity, req.body.description]
    );

    const dataBuffer = Buffer.from(JSON.stringify(product.rows[0]));
    await pubSubClient
      .topic(topicNameOrId)
      .publishMessage({ data: dataBuffer });

    res.status(201).json({
      data: {
        id: product.rows[0].id,
      },
    });
  } else {
    res.sendStatus(405);
  }
  await client.end();
});
