const champInfo = {};

const addRole = (champ, role) => {
  if (champ in champInfo === false) champInfo[champ] = [];

  champInfo[champ].push(role);
};

module.exports = {
  blitzgg: {
    fetchRoles: async (browser) => {
      const page = await browser.newPage();

      await page.goto('https://blitz.gg/lol/champions/overview', { waitUntil: 'networkidle2', timeout: 0 });

      await page.waitForTimeout(4000);

      await page.waitForSelector('[class^="Champions__TableWrapper"]');

      const champLinks = await page.evaluate(() => {
        const links = Array.from(document.querySelectorAll('.champion-link'));
        return links.map((link) => link.href.substring(31));
      });

      champLinks.forEach((link) => {
        const [champ, roleString] = link.split('?');

        addRole(champ, roleString.split('role=')[1]);
      });

      return champInfo;
    },
  },
  championgg: {},
  opgg: {},
  ugg: {},
};
