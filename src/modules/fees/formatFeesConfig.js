const {
  convertAmountToSmallestUnit,
} = require('../../utils/convertAmountToSmallestUnit');

function formatFeesConfig(config) {
  const convertedConfig = JSON.parse(JSON.stringify(config)); // Deep copy to avoid mutation

  Object.keys(convertedConfig).forEach((key) => {
    const item = convertedConfig[key];
    if (item.max) {
      item.max.amount = convertAmountToSmallestUnit(item.max.amount);
    }
    if (item.week_limit) {
      item.week_limit.amount = convertAmountToSmallestUnit(
        item.week_limit.amount,
      );
    }
    if (item.min) {
      item.min.amount = convertAmountToSmallestUnit(item.min.amount);
    }
  });

  return convertedConfig;
}

module.exports = { formatFeesConfig };
