const {
  currencySmallestUnits,
  DEFAULT_CURRENCY,
} = require('../constants/money');

/**
 * Convert amount to smallest unit based on currency.
 * @param {number} amount - The amount in the base currency.
 * @param {string} currency - The currency code (e.g., 'USD').
 * @returns {number} - The amount in smallest units.
 */
function convertAmountToSmallestUnit(amount, currency = DEFAULT_CURRENCY) {
  const smallestUnitValue = currencySmallestUnits.get(currency);
  return Math.round(amount / smallestUnitValue);
}

module.exports = { convertAmountToSmallestUnit };
