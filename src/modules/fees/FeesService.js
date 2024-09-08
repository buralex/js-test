const { feesConfig } = require('./feesConfig');
const { formatFeesConfig } = require('./formatFeesConfig');

class FeesService {
  getFeesConfig() {
    // Can be fetched from somewhere else, but for simplicity it's hardcoded
    return new Promise((resolve) => {
      resolve(formatFeesConfig(feesConfig));
    });
  }
}

module.exports = { FeesService };
