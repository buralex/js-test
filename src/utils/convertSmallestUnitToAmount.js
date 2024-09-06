const {
  currencySmallestUnits,
  DEFAULT_CURRENCY,
} = require('../constants/money');

/**
 * Convert smallest unit to amount based on currency.
 * @param {number} smallestUnitAmount - The amount in smallest units.
 * @param {string} currency - The currency code (e.g., 'USD').
 * @returns {number} - The amount in base currency.
 */
function convertSmallestUnitToAmount(
  smallestUnitAmount,
  currency = DEFAULT_CURRENCY,
) {
  const smallestUnitValue = currencySmallestUnits.get(currency);
  return smallestUnitAmount * smallestUnitValue;
}

module.exports = { convertSmallestUnitToAmount };
