const fs = require('fs');
const dotenv = require('dotenv');
const axios = require('axios');
const { MongoClient } = require('mongodb');

dotenv.config();

const dbURI = process.env.MONGODB_URI;
const client = new MongoClient(dbURI, { useUnifiedTopology: true, useNewUrlParser: true });

const ddURL = 'https://ddragon.leagueoflegends.com';
const now = Date.now();
const updateInterval = 86400000;

const importChamps = async (champs) => {
  const remainingChamps = [...champs];
  const currentChamp = remainingChamps.shift();

  const { champID } = currentChamp;

  const db = client.db('lolcq');

  const filter = { champID };
  const update = { $set: currentChamp };
  const options = { upsert: true };

  await db.collection('championInfo').updateOne(filter, update, options);

  if (remainingChamps.length) return importChamps(remainingChamps);
  return true;
};

module.exports = {
  importChampData: async () => {
    try {
      const { lastUpdated, currentWorkingPatch } = JSON.parse(fs.readFileSync('./versionHistory.txt'));
      const { data: [currentLivePatch] } = await axios.get(`${ddURL}/api/versions.json`);

      // short-circuit if we are on the current patch and have updated recently
      if ((currentLivePatch === currentWorkingPatch) && (now < Number(lastUpdated) + updateInterval)) return true;

      const { data: { data: champInfo } } = await axios.get(`${ddURL}/cdn/${currentLivePatch}/data/en_US/champion.json`);

      const parsedChamps = Object.entries(champInfo).reduce((acc, [internalName, { name: champName, key: champID }]) => {
        const champs = [...acc];

        champs.push({
          champID,
          internalName,
          champName,
        });

        return champs;
      }, []);

      await client.connect();

      await importChamps(parsedChamps);
    } catch (err) {
      console.error(err);
    } finally {
      await client.close();
    }
  },
};
