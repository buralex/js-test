const {
  convertAmountToSmallestUnit,
} = require('../../utils/convertAmountToSmallestUnit');

function formatOperationsData(operationsData) {
  return operationsData.map((item) => {
    return {
      ...item,
      operation: {
        ...item.operation,
        amount: convertAmountToSmallestUnit(item.operation.amount),
      },
    };
  });
}

module.exports = { formatOperationsData };
