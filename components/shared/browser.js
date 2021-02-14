const puppeteer = require('puppeteer');

module.exports = {
  startBrowser: async () => {
    let browser;

    try {
      browser = await puppeteer.launch({
        headless: false,
        'ignoreHTTPSErrors': true,
      });
    } catch (err) {
      console.error('Unable to create browser instance => : ', err);
    }

    return browser;
  },
};
