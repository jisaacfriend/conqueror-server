const lastUpdated = Date.now();

let importCount = 0;

const importBuilds = async (client, builds) => {
  const remainingBuilds = [...builds];
  const currentBuild = remainingBuilds.shift();

  const buildData = {
    ...currentBuild,
    lastUpdated,
  }

  const { buildID } = currentBuild;
  
  const db = client.db('lolcq');

  const filter = { buildID };
  const update = { $set: buildData };
  const options = { upsert: true };

  const { modifiedCount, upsertedId } = await db.collection('builds').updateOne(filter, update, options);

  if (modifiedCount === 1 || upsertedId) importCount +=1;

  if (remainingBuilds.length) return importBuilds(client, remainingBuilds);
  return importCount;
};

module.exports = {
  importBuilds,
};
