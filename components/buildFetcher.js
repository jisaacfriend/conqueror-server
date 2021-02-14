const champBuilds = [];
let retries = 0;

const fetchRoleData = {
  blitzgg: async (browser, champID, champName, roles) => Promise.all(roles.map(async (role) => {
    const sourceName = 'blitzgg';
    const buildURL = `https://blitz.gg/lol/champions/${champName}?role=${role}`;

    const page = await browser.newPage();

    await page.goto(buildURL, { waitUntil: 'networkidle2', timeout: 0 });

    await page.waitForTimeout(4000);

    const [starting, ...fullBuild] = await page.evaluate(() => {
      const itemListDivs = Array.from(document.querySelectorAll('div[class^="ItemBuild__List"][cols="7"] div[class^="ItemBuild__Item"]'));

      return itemListDivs.map((div, i) => {
        if (i === 0) {
          return Array.from(div.querySelectorAll('img'))
            .map((img) => img.src.split('/item/')[1].split('.')[0]);
        }

        const imgTag = div.querySelector(`div > img`);
        return imgTag.src.split('/item/')[1].split('.')[0];
      });
    });

    await page.close();

    return Promise.resolve({ sourceName, role, mostCommonItems: { starting, fullBuild } });
  })),
  championgg: async () => { },
  opgg: async () => { },
  ugg: async () => { },
};

const iterateSources = async (browser, champID, champName, sources) => {
  const remainingSources = [...sources];
  const [currentSource, roles] = remainingSources.shift();

  if (roles.length) {
    const buildData = await fetchRoleData[currentSource](browser, champID, champName, roles);

    buildData.forEach(({ sourceName, role, mostCommonItems }) => {
      const { starting, fullBuild } = mostCommonItems;

      if (starting === undefined) {
        retries += 1;
        console.log(`[${sourceName}:${champName}]: No build data for role: ${role}. Retrying (${retries})...`);
        remainingSources.push([currentSource, [role]]);
      } else {
        champBuilds.push({
          sourceName,
          champID,
          champName,
          role,
          buildID: `${sourceName}-${champID}-${role}`,
          mostCommon: {
            starting,
            fullBuild
          }
        });
      }
    });
  }

  if (remainingSources.length) return iterateSources(browser, champID, champName, remainingSources);
  return true;
};

const processChamps = async (browser, champs) => {
  const remainingChamps = [...champs];
  const currentChamp = remainingChamps.shift();
  const { champID, champName, roles } = currentChamp;

  await iterateSources(browser, champID, champName, Object.entries(roles));

  if (remainingChamps.length) return processChamps(browser, remainingChamps);
  return champBuilds;
};

module.exports = {
  processChamps,
};