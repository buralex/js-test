const { mockFeesConfig } = require('./mocks/feesConfig.mock');
const { mockOperationsData } = require('./mocks/operationsData.mock');
const { FeesService } = require('./modules/fees/FeesService');
const { formatFeesConfig } = require('./modules/fees/formatFeesConfig');
const {
  CommissionCalculator,
} = require('./modules/operations/CommissionCalculator');
const {
  formatOperationsData,
} = require('./modules/operations/formatOperationsData');
const { formatOutput } = require('./modules/operations/formatOutput');
const {
  convertSmallestUnitToAmount,
} = require('./utils/convertSmallestUnitToAmount');

describe('Commission Fee Calculation', () => {
  let commissionCalculator;

  beforeEach(async () => {
    jest
      .spyOn(FeesService.prototype, 'getFeesConfig')
      .mockImplementation(() => {
        return Promise.resolve(formatFeesConfig(mockFeesConfig));
      });
    const feesService = new FeesService();
    const feesConfigInSmallestUnit = await feesService.getFeesConfig();
    commissionCalculator = new CommissionCalculator(feesConfigInSmallestUnit);
  });

  test('smoke test should return correct commission fees', () => {
    const operationDataInSmallestUnit =
      formatOperationsData(mockOperationsData);
    const commissionFees = commissionCalculator.calculateCommission(
      operationDataInSmallestUnit,
    );

    const formattedCommissionFees = commissionFees.map((fee) =>
      formatOutput(fee),
    );

    const expectedFees = `
0.06
0.90
87.00
3.00
0.30
0.30
5.00
0.00
0.00
`;

    expect(formattedCommissionFees.join('\n')).toBe(expectedFees.trim());
  });

  test('should NOT charge natural person for cashOut if weekly limit is not exceeded', () => {
    const tuesdayOnTheFirstWeek = '2024-09-03';
    const tuesdayOnTheSecondWeek = '2024-09-10';
    const operationDataInSmallestUnit = formatOperationsData([
      {
        date: tuesdayOnTheFirstWeek,
        user_id: 1,
        user_type: 'natural',
        type: 'cash_out',
        operation: { amount: 1000.0, currency: 'EUR' },
      },
      {
        date: tuesdayOnTheSecondWeek,
        user_id: 1,
        user_type: 'natural',
        type: 'cash_out',
        operation: { amount: 1000.0, currency: 'EUR' },
      },
    ]);

    const commissionFees = commissionCalculator.calculateCommission(
      operationDataInSmallestUnit,
    );

    expect(convertSmallestUnitToAmount(commissionFees[0])).toBe(0);
    expect(convertSmallestUnitToAmount(commissionFees[1])).toBe(0);
  });

  test('should charge natural person for cashOut if weekly limit has been exceeded', () => {
    const tuesdayOnTheFirstWeek = '2024-09-03';
    const wednesdayOnTheFirstWeek = '2024-09-04';
    const thursdayOnTheFirstWeek = '2024-09-05';

    const mondayOnTheSecondWeek = '2024-09-09';
    const tuesdayOnTheSecondWeek = '2024-09-10';

    const operationDataInSmallestUnit = formatOperationsData([
      {
        date: tuesdayOnTheFirstWeek,
        user_id: 1,
        user_type: 'natural',
        type: 'cash_out',
        operation: { amount: 500.0, currency: 'EUR' },
      },
      {
        date: wednesdayOnTheFirstWeek,
        user_id: 1,
        user_type: 'natural',
        type: 'cash_out',
        operation: { amount: 500.0, currency: 'EUR' },
      },
      {
        date: thursdayOnTheFirstWeek,
        user_id: 1,
        user_type: 'natural',
        type: 'cash_out',
        operation: { amount: 1000.0, currency: 'EUR' },
      },
      {
        date: mondayOnTheSecondWeek,
        user_id: 1,
        user_type: 'natural',
        type: 'cash_out',
        operation: { amount: 900.0, currency: 'EUR' },
      },
      {
        date: tuesdayOnTheSecondWeek,
        user_id: 1,
        user_type: 'natural',
        type: 'cash_out',
        operation: { amount: 200.0, currency: 'EUR' },
      },
    ]);

    const commissionFees = commissionCalculator.calculateCommission(
      operationDataInSmallestUnit,
    );

    expect(convertSmallestUnitToAmount(commissionFees[0])).toBe(0);
    expect(convertSmallestUnitToAmount(commissionFees[1])).toBe(0);
    expect(convertSmallestUnitToAmount(commissionFees[2])).toBe(3);
    expect(convertSmallestUnitToAmount(commissionFees[3])).toBe(0);
    expect(convertSmallestUnitToAmount(commissionFees[4])).toBe(0.3);
  });

  test('should not charge more than 5 euro for cash_in operation', () => {
    const operationDataInSmallestUnit = formatOperationsData([
      {
        date: '2016-01-05',
        user_id: 1,
        user_type: 'natural',
        type: 'cash_in',
        operation: { amount: 2000000.0, currency: 'EUR' },
      },
    ]);

    const commissionFees = commissionCalculator.calculateCommission(
      operationDataInSmallestUnit,
    );

    expect(convertSmallestUnitToAmount(commissionFees[0])).toBe(5);
  });

  test('should not charge less than 0.5 euro for cashOut by legal person', () => {
    const operationDataInSmallestUnit = formatOperationsData([
      {
        date: '2016-01-05',
        user_id: 1,
        user_type: 'juridical',
        type: 'cash_out',
        operation: { amount: 1.0, currency: 'EUR' },
      },
    ]);

    const commissionFees = commissionCalculator.calculateCommission(
      operationDataInSmallestUnit,
    );

    expect(convertSmallestUnitToAmount(commissionFees[0])).toBe(0.5);
  });

  test('should throw error if the currency is not EUR', () => {
    const operationDataInSmallestUnit = formatOperationsData([
      ...mockOperationsData,
      {
        date: '2016-01-05',
        user_id: 1,
        user_type: 'natural',
        type: 'cash_in',
        operation: { amount: 200.0, currency: 'USD' },
      },
    ]);

    expect(() => {
      commissionCalculator.calculateCommission(operationDataInSmallestUnit);
    }).toThrow('Currency not supported');
  });

  test('should throw error if the operation type is not supported', () => {
    const operationDataInSmallestUnit = formatOperationsData([
      ...mockOperationsData,
      {
        date: '2016-01-05',
        user_id: 1,
        user_type: 'natural',
        type: 'cash_transfer',
        operation: { amount: 200.0, currency: 'EUR' },
      },
    ]);

    expect(() => {
      commissionCalculator.calculateCommission(operationDataInSmallestUnit);
    }).toThrow('Operation type or user type not supported');
  });
});
