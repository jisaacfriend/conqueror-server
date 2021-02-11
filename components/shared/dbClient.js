const { MongoClient } = require('mongodb');
const dotenv = require('dotenv');

dotenv.config();

module.exports = {
  connect: async () => {
    const dbURI = process.env.MONGODB_URI;
    const client = new MongoClient(dbURI, { useUnifiedTopology: true, useNewUrlParser: true });

    await client.connect();

    return client;
  },
};