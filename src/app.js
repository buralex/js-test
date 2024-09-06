const { getInputData } = require('./getInputData');
const {
  formatOperationsData,
} = require('./modules/operations/formatOperationsData');
const { formatOutput } = require('./modules/operations/formatOutput');
const {
  CommissionCalculator,
} = require('./modules/operations/CommissionCalculator');
const { FeesService } = require('./modules/fees/FeesService');

async function main() {
  const operationsData = await getInputData();
  // Converting amounts to cents - to avoid calculation precision errors.
  // Alternatively, special libraries can be used for calculations.
  const operationDataInSmallestUnit = formatOperationsData(operationsData);
  const feesService = new FeesService();
  const feesConfigInSmallestUnit = await feesService.getFeesConfig();

  const commissionCalculator = new CommissionCalculator(
    feesConfigInSmallestUnit,
  );

  const commissionFees = commissionCalculator.calculateCommission(
    operationDataInSmallestUnit,
  );

  commissionFees.forEach((fee) => console.info(formatOutput(fee)));
}

main();
