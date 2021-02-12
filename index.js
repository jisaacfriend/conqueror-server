const Browser = require('./components/shared/browser');
const dbClient = require('./components/shared/dbClient');

const champImporter = require('./components/champImporter');
const dataFetcher = require('./components/dataFetcher');
const roleImporter = require('./components/roleImporter');

const sources = ['blitzgg'];

const importChampData = async () => {
  try {
    const client = await dbClient.connect();
    const importCount = await champImporter.importChampData(client);

    await client.close();

    const msg = importCount === -1
      ? 'Data is up-to-date. Import skipped.'
      : `Imported ${importCount} champion object(s)!`

    console.log(msg);
  } catch (err) {
    console.error(err);
  }
};

const importRoleData = async () => {
  let BrowserInstance = await Browser.startBrowser();

  const roleInfo = await Promise.all(sources.map(async (source) => {
    const roleData = await dataFetcher[source].fetchRoles(BrowserInstance);

    return [source, roleData];
  }));

  await BrowserInstance.close();

  const client = await dbClient.connect();

  let OUTPUT = new Map();

  const importRoles = async (roleInfo) => {
    const remainingRoleInfo = [...roleInfo];
    const [source, champInfo] = remainingRoleInfo.shift();

    let champCount = 0;

    await Promise.all(Object.entries(champInfo).map(async ([champ, roles]) => {
      champCount += 1;

      await roleImporter.importRoles(client, source, champ, roles);

      return Promise.resolve();
    }));

    OUTPUT.set(source, champCount);

    if (remainingRoleInfo.length) return importRoles(remainingRoleInfo);
    return true;
  };

  await importRoles(roleInfo);

  await client.close();

  OUTPUT.forEach((count, source) => console.log(`${source}: ${count} champ roles updated!`));
};

execute();