const fs = require('fs');
const axios = require('axios');
const { MongoClient } = require('mongodb');

const dbURI = 'mongodb+srv://admin:ZhaoZ%21long1@lolcq-cluster.t2yqj.mongodb.net/lolcq?retryWrites=true&w=majority';
const client = new MongoClient(dbURI, { useUnifiedTopology: true, useNewUrlParser: true });

const ddURL = 'https://ddragon.leagueoflegends.com';
const now = Date.now();
const updateInterval = 86400000;

let output = [];

const importChamps = async (champs) => {
  const remainingChamps = [...champs];
  const currentChamp = remainingChamps.shift();

  const { champID } = currentChamp;

  const db = client.db('lolcq');

  const filter = { champID };
  const update = { $set: currentChamp };
  const options = { upsert: true };
  
  const res = await db.collection('championInfo').updateOne(filter, update, options);

  output.push(res);

  if (remainingChamps.length) return importChamps(remainingChamps);
  return true;
};

module.exports = {
  fetchChampInfo: async () => {
    let docs;

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

      return output;
    } catch (err) {
      console.error(err);
    } finally {
      await client.close();
    }

    return docs;
  },
};
