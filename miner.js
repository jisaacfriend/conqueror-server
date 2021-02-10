const champImporter = require('./champImporter');
const Browser = require('./components/browser');
const roleParser = require('./components/roleParser');


const modes = process.argv.slice(2);

const processor = {
  fetchRiotChampInfo: async () => await champImporter.fetchChampInfo(),
  fetchRoles: async (browser) => await roleParser.parseChampionRoles(browser),
};

const executeModes = async (modes) => {
  const remainingModes = [...modes];
  const currentMode = remainingModes.shift();

  let BrowserInstance;
  let modeArgs = [];

  if (!currentMode.includes('Riot')) {
    BrowserInstance = await Browser.startBrowser();
    modeArgs.push(BrowserInstance);
  }

  const res = await processor[currentMode](modeArgs);

  console.log(res);

  if (!currentMode.includes('Riot')) await BrowserInstance.close();

  if (remainingModes.length) return executeModes(remainingModes);
  return true;
};

executeModes(modes);
