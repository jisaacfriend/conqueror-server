const champInfo = new Map();

const addRole = (champ, role) => {
  if (!champInfo.has(champ)) {
    champInfo.set(champ, [role]);

    return true;
  }

  const currentRoles = champInfo.get(champ);

  champInfo.set(champ, [...currentRoles, role]);
};

module.exports = {
  blitzgg: {
    fetchRoles: async (browser) => {
      const page = await browser.newPage();

      await page.goto('https://blitz.gg/lol/champions/overview', { waitUntil: 'networkidle2' });

      await page.waitForTimeout(3000);

      await page.waitForSelector('[class^="Champions__TableWrapper"]')

      const champLinks = await page.evaluate(() => {
        const links = Array.from(document.querySelectorAll('.champion-link'));
        return links.map((link) => link.href.substring(31));
      });

      champLinks.forEach((link) => {
        const [champ, roleString] = link.split('?');

        addRole(champ, roleString.substring(5));
      });

      return champInfo;
    },
  },
  championgg: {},
  opgg: {},
  ugg: {},
};
