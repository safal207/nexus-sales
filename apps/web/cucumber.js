const { setWorldConstructor } = require('@cucumber/cucumber');
const { chromium } = require('playwright');

class CustomWorld {
  constructor() {
    this.page = null;
    this.browser = null;
  }

  async init() {
    this.browser = await chromium.launch();
    this.page = await this.browser.newPage();
    // Set default timeout
    this.page.setDefaultTimeout(30000);
  }

  async cleanup() {
    if (this.page) {
      await this.page.close();
    }
    if (this.browser) {
      await this.browser.close();
    }
  }
}

setWorldConstructor(CustomWorld);

module.exports = {
  default: {
    require: [
      'tests/bdd/step-definitions/**/*.steps.ts'
    ],
    format: [
      'html:cucumber-report.html',
      'json:cucumber-results.json'
    ],
    formatOptions: {
      snippetInterface: 'async-await'
    },
    paths: [
      'tests/bdd/features/**/*.feature'
    ],
    publishQuiet: true,
    parallel: 2,
    retry: 1,
    retryTagFilter: '@flaky',
    tags: 'not @skip',
    timeout: 30000,
    worldParameters: {}
  }
};
