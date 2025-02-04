const puppeteer = require('puppeteer');

const blockedResourceTypes = [
  'image',
  'media',
  'font',
  'texttrack',
  'object',
  'beacon',
  'csp_report',
  'imageset',
  'stylesheet',
  'font',
];

const skippedResources = [
  'quantserve',
  'adzerk',
  'doubleclick',
  'adition',
  'exelator',
  'sharethrough',
  'cdn.api.twitter',
  'google-analytics',
  'googletagmanager',
  'google',
  'fontawesome',
  'facebook',
  'analytics',
  'optimizely',
  'clicktale',
  'mixpanel',
  'zedo',
  'clicksor',
  'tiqcdn',
];

const puppeteerFetch = async (url) => {
  const browserFetcher = puppeteer.createBrowserFetcher();
  const localChromiums = await browserFetcher.localRevisions();

  if (!localChromiums.length) {
    return console.error("Can't find installed Chromium");
  }

  const { executablePath } = browserFetcher.revisionInfo(localChromiums[0]);

  const browser = await puppeteer.launch({
    executablePath: executablePath,
    headless: true,
  });

  const page = await browser.newPage();
  await page.setRequestInterception(true);

  page.on('request', (req) => {
    const requestUrl = req._url.split('?')[0].split('#')[0];
    if (
      blockedResourceTypes.indexOf(req.resourceType()) !== -1 ||
      skippedResources.some((resource) => requestUrl.indexOf(resource) !== -1)
    ) {
      req.abort();
    } else {
      req.continue();
    }
  });

  const response = await page.goto(url);

  if (response._status < 400) {
    let html = await page.content();
    try {
      await browser.close();
    } finally {
      return html;
    } // avoid websocket error if browser already closed
  } else {
    try {
      await browser.close();
    } finally {
      return Promise.reject(response._status);
    }
  }
};

export default puppeteerFetch;
