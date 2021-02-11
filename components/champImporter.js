const fs = require('fs');
const axios = require('axios');

const ddURL = 'https://ddragon.leagueoflegends.com';
const now = Date.now();
const updateInterval = 86400000;

let roles = {
  blitzgg: [],
  championgg: [],
  opgg: [],
  ugg: [],
};

let res = 0;

const importChamps = async (champs, client) => {
  const remainingChamps = [...champs];
  const currentChamp = remainingChamps.shift();

  const { champID } = currentChamp;

  const db = client.db('lolcq');

  const filter = { champID };
  const update = { $set: currentChamp };
  const options = { upsert: true };

  const { matchedCount } = await db.collection('championInfo').updateOne(filter, update, options);

  res += matchedCount;

  if (remainingChamps.length) return importChamps(remainingChamps);
  return true;
};

module.exports = {
  importChampData: async (client) => {
    try {
      const { lastUpdated, currentWorkingPatch } = JSON.parse(fs.readFileSync('./versionHistory.txt'));
      const { data: [currentLivePatch] } = await axios.get(`${ddURL}/api/versions.json`);

      // short-circuit if we are on the current patch and have updated recently
      if ((currentLivePatch === currentWorkingPatch) && (now < Number(lastUpdated) + updateInterval)) return res;

      const { data: { data: champInfo } } = await axios.get(`${ddURL}/cdn/${currentLivePatch}/data/en_US/champion.json`);

      const parsedChamps = Object.entries(champInfo).reduce((acc, [internalName, { name: champName, key: champID }]) => {
        const champs = [...acc];

        champs.push({
          champID,
          internalName,
          champName,
          roles,
        });

        return champs;
      }, []);

      await importChamps(parsedChamps, client);

      // Update the info about when last update happened
      fs.writeFileSync('./versionHistory.txt', JSON.stringify({ lastUpdated: now, currentWorkingPatch: currentLivePatch }));
    } catch (err) {
      console.error(err);
    }

    return res;
  },
};
