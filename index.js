const { hrtime } = require('process');

const Browser = require('./components/shared/browser');
const dbClient = require('./components/shared/dbClient');

const champImporter = require('./components/champImporter');
const roleFetcher = require('./components/roleFetcher');
const roleImporter = require('./components/roleImporter');
const champFetcher = require('./components/champFetcher');
const buildFetcher = require('./components/buildFetcher');
const buildImporter = require('./components/buildImporter');

const start = hrtime();

const sources = ['blitzgg'];

const importChampData = async () => {
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

  const [seconds, milliseconds] = hrtime(start);

  console.log('\nExecution time: %ds %dms', seconds, milliseconds);
};

const importRoleData = async () => {
  let BrowserInstance = await Browser.startBrowser();

  const roleInfo = await Promise.all(sources.map(async (source) => {
    const roleData = await roleFetcher[source].fetchRoles(BrowserInstance);

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

  const [seconds, milliseconds] = hrtime(start);

  console.log('\nExecution time: %ds %dms', seconds, milliseconds);
};

const importBuildData = async () => {
  const client = await dbClient.connect();

  const champsArray = await champFetcher.fetchChampInfo(client);

  let BrowserInstance = await Browser.startBrowser();

  const champBuilds = await buildFetcher.processChamps(BrowserInstance, champsArray);

  await BrowserInstance.close();

  const importedCount = await buildImporter.importBuilds(client, champBuilds);

  await client.close();

  const [seconds, milliseconds] = hrtime(start);

  console.log('\nImported %d builds.\nExecution time: %ds %dms', importedCount, seconds, milliseconds);
};

const execute = async () => {};

// importChampData();

// importRoleData();

importBuildData();

// execute();