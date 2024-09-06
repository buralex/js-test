const { DEFAULT_CURRENCY } = require('../../constants/money');
const { operationTypes, userTypes } = require('../../constants/operations');
const { getWeekStartISOString } = require('../../utils/getWeekStartISOString');

class CommissionCalculator {
  constructor(feesConfig) {
    this.feesConfig = feesConfig;
    this.usersWeeklyLimits = new Map(); // Track weekly limits for each user
    this.commissionFees = [];
  }

  getCommissionCalculator({ operationType, userType }) {
    const calculators = {
      [operationTypes.cashIn]: this.calculateCashInCommission.bind(this),
      [operationTypes.cashOut]: {
        [userTypes.natural]: this.calculateCashOutCommissionNatural.bind(this),
        [userTypes.juridical]:
          this.calculateCashOutCommissionJuridical.bind(this),
      },
    };

    if (operationType === operationTypes.cashOut) {
      return calculators[operationType][userType];
    }

    return calculators[operationType];
  }

  calculateFeeByPercentage(amount, feePercentage) {
    return Math.ceil((amount * feePercentage) / 100);
  }

  calculateCashInCommission({ amount }) {
    const fee = this.calculateFeeByPercentage(
      amount,
      this.feesConfig.cashIn.percents,
    );
    return Math.min(fee, this.feesConfig.cashIn.max.amount);
  }

  updateUserWeeklyTotal(userKey, amount) {
    this.usersWeeklyLimits.set(userKey, amount);
  }

  getUserWeeklyTotal(userKey) {
    return this.usersWeeklyLimits.get(userKey);
  }

  /**
   * Calculates CashOut commission taking into account weekly limits.
   */
  calculateCashOutCommissionNatural({ amount, userId, date }) {
    // Weekly limit tracking is implemented by keeping the weekly total amount under specific `userKey`.
    // The tricky part is `weekStartISOString` - that represents the Monday ISO date.
    // So the `userKey` for any day of the week - will be like `userId_MondayISOdate`.
    const weekLimit = this.feesConfig.cashOutNatural.week_limit.amount;
    const cashOutNaturalPercent = this.feesConfig.cashOutNatural.percents;
    const weekStartISOString = getWeekStartISOString(date);
    const userKey = `${userId}_${weekStartISOString}`;
    let currentWeeklyTotal = this.getUserWeeklyTotal(userKey);

    // Initiate total weekly limit tracking
    if (currentWeeklyTotal === undefined) {
      currentWeeklyTotal = 0;
    }

    const newWeeklyTotal = currentWeeklyTotal + amount;
    this.updateUserWeeklyTotal(userKey, newWeeklyTotal);

    // If previous operations already exceeded the limit, then charge for full operation amount
    if (currentWeeklyTotal > weekLimit) {
      return this.calculateFeeByPercentage(amount, cashOutNaturalPercent);
    }

    // If the weekly limit is not exceeded then commission is NOT charged
    if (newWeeklyTotal <= weekLimit) {
      return 0;
    }

    // If the user has exceeded the weekly limit for the first time
    const exceededAmount = newWeeklyTotal - weekLimit;

    return this.calculateFeeByPercentage(exceededAmount, cashOutNaturalPercent);
  }

  calculateCashOutCommissionJuridical({ amount }) {
    const fee = this.calculateFeeByPercentage(
      amount,
      this.feesConfig.cashOutJuridical.percents,
    );
    return Math.max(fee, this.feesConfig.cashOutJuridical.min.amount);
  }

  calculateCommission(operationsData) {
    operationsData.forEach((item) => {
      const {
        date,
        user_id: userId,
        user_type: userType,
        type: operationType,
        operation: { amount, currency },
      } = item;

      if (currency !== DEFAULT_CURRENCY) {
        throw new Error('Currency not supported');
      }

      const commissionCalculator = this.getCommissionCalculator({
        operationType,
        userType,
      });

      if (!commissionCalculator) {
        throw new Error('Operation type or user type not supported');
      }

      const fee = commissionCalculator({ amount, userId, date });
      this.commissionFees.push(fee);
    });

    return this.commissionFees;
  }
}

module.exports = { CommissionCalculator };
