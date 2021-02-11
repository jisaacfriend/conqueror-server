const browser = require('./components/shared/browser');
const dbClient = require('./components/shared/dbClient');
const champImporter = require('./components/champImporter');

const execute = async () => {
  try {
    const client = await dbClient.connect();
    const importCount = await champImporter.importChampData(client);

    await client.close();

    console.log(`Imported ${importCount} champion object(s)!`);
  } catch (err) {
    console.error(err);
  }
};

execute();