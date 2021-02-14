module.exports = {
  fetchChampInfo: async (client) => {
    const db = client.db('lolcq');

    const query = { champName: { $in: ['Pantheon', 'Neeko', 'Nocturne', 'Dr. Mundo'] } };
    const options = {
      projection: {
        _id: 0,
        champID: 1,
        champName: 1,
        internalName: 1,
        roles: 1,
      },
    };

    return db.collection('championInfo').find(query, options).toArray();
  },
};
