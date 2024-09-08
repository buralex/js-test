const { DEFAULT_CURRENCY } = require('../../constants/money');
const { operationTypes, userTypes } = require('../../constants/operations');
const { getWeekStartISOString } = require('../../utils/getWeekStartISOString');

class CommissionCalculator {
  constructor(feesConfig) {
    this.feesConfig = feesConfig;
    this.usersWeeklyLimits = new Map(); // Track weekly limits for each user

    this.calculators = {
      [operationTypes.cashIn]: this.calculateCashInCommission.bind(this),
      [operationTypes.cashOut]: {
        [userTypes.natural]: this.calculateCashOutCommissionNatural.bind(this),
        [userTypes.juridical]:
          this.calculateCashOutCommissionJuridical.bind(this),
      },
    };
  }

  getCommissionCalculator({ operationType, userType }) {
    if (operationType === operationTypes.cashOut) {
      return this.calculators[operationType][userType];
    }

    return this.calculators[operationType];
  }

  calculateFeeByPercentage(amount, feePercentage) {
    return Math.ceil((amount * feePercentage) / 100);
  }

  calculateCashInCommission({ amount }) {
    const { cashIn } = this.feesConfig;
    return Math.min(
      this.calculateFeeByPercentage(amount, cashIn.percents),
      cashIn.max.amount,
    );
  }

  getWeeklyUserKey(userId, date) {
    // `weekStartISOString` - represents the Monday ISO date.
    // So the `userKey` for any day of the week - will be like `userId_MondayISOdate`.
    const weekStartISOString = getWeekStartISOString(date);
    return `${userId}_${weekStartISOString}`;
  }

  calculateCashOutCommissionNatural({ amount, userId, date }) {
    const { cashOutNatural } = this.feesConfig;
    // Weekly limit tracking is implemented by keeping the weekly total amount under specific `userKey`.
    const userKey = this.getWeeklyUserKey(userId, date);
    const currentTotal = this.usersWeeklyLimits.get(userKey) || 0;

    const newTotal = currentTotal + amount;
    this.usersWeeklyLimits.set(userKey, newTotal);

    if (currentTotal > cashOutNatural.week_limit.amount) {
      return this.calculateFeeByPercentage(amount, cashOutNatural.percents);
    }

    const remainingLimit = cashOutNatural.week_limit.amount - currentTotal;
    const amountToCharge = Math.max(amount - remainingLimit, 0);
    return this.calculateFeeByPercentage(
      amountToCharge,
      cashOutNatural.percents,
    );
  }

  calculateCashOutCommissionJuridical({ amount }) {
    const { cashOutJuridical } = this.feesConfig;
    return Math.max(
      this.calculateFeeByPercentage(amount, cashOutJuridical.percents),
      cashOutJuridical.min.amount,
    );
  }

  calculateCommissionForOperation(operation) {
    const {
      date,
      user_id: userId,
      user_type: userType,
      type: operationType,
      operation: { amount, currency },
    } = operation;

    if (currency !== DEFAULT_CURRENCY) {
      throw new Error('Currency not supported');
    }
    const calculator = this.getCommissionCalculator({
      operationType,
      userType,
    });

    if (!calculator) {
      throw new Error('Operation type or user type not supported');
    }

    return calculator({ amount, userId, date });
  }

  calculateCommission(operationsData) {
    return operationsData.map((item) =>
      this.calculateCommissionForOperation(item),
    );
  }
}

module.exports = { CommissionCalculator };
