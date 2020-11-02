'use strict';

const Homey = require('homey');

class TempiroApp extends Homey.App {
  /**
   * onInit is called when the app is initialized.
   */
  async onInit() {
    this.log('TempiroApp has been initialized');
  }
}

module.exports = TempiroApp;