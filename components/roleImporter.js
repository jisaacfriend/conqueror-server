let res = 0;

module.exports = {
  importRoles: async (client, source, champ, roles) => {
    const roleData = {
      [`roles.${source}`]: roles,
    }
    const roleSourceDataPath = `roles.${source}`;
    const db = client.db('lolcq');

    const filter = { internalName: champ };
    const update = { $set: roleData };
    const options = { upsert: true };

    const { matchedCount } = await db.collection('championInfo').updateOne(filter, update, options);

    res += matchedCount;
  
    return res;
  },
};
