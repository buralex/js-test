const {
  convertSmallestUnitToAmount,
} = require('../../utils/convertSmallestUnitToAmount');

const formatOutput = (feeInSmallestUnit) =>
  convertSmallestUnitToAmount(feeInSmallestUnit).toFixed(2);

module.exports = { formatOutput };
