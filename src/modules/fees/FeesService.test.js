const { mockFeesConfig } = require('../../mocks/feesConfig.mock');
const { FeesService } = require('./FeesService');

const mockFormattedFeesConfig = {
  cashIn: { max: { amount: 500, currency: 'EUR' }, percents: 0.03 },
  cashOutJuridical: { min: { amount: 50, currency: 'EUR' }, percents: 0.3 },
  cashOutNatural: {
    percents: 0.3,
    week_limit: { amount: 100000, currency: 'EUR' },
  },
};

jest.mock('./feesConfig', () => ({
  feesConfig: mockFeesConfig,
}));

describe('FeesService', () => {
  let feesService;

  beforeEach(() => {
    feesService = new FeesService();
  });

  it('should return formatted fees config', async () => {
    const result = await feesService.getFeesConfig();
    expect(result).toEqual(mockFormattedFeesConfig);
  });
});
