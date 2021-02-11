const browser = require('./components/shared/browser');
const dbClient = require('./components/shared/dbClient');
const champImporter = require('./components/champImporter');

const execute = async () => {
  try {
    const client = await dbClient.connect();
    const importCount = await champImporter.importChampData(client);

    await client.close();

    const msg = importCount === -1
      ? `Data is up-to-date. Import skipped.`
      : `Imported ${importCount} champion object(s)!`

    console.log(msg);
  } catch (err) {
    console.error(err);
  }
};

execute();