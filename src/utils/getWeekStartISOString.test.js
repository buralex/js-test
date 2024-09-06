const { getWeekStartISOString } = require('./getWeekStartISOString');

describe('getWeekStartISOString', () => {
  it('should return Monday ISO string for any day of the week', async () => {
    const monday = '2024-09-02';
    const tuesday = '2024-09-03';
    const wednesday = '2024-09-04';
    const thursday = '2024-09-05';
    const friday = '2024-09-06';
    const saturday = '2024-09-07';
    const sunday = '2024-09-08';
    const mondayNextWeek = '2024-09-09';
    const tuesdayNextWeek = '2024-09-10';

    const result = [
      getWeekStartISOString(monday),
      getWeekStartISOString(tuesday),
      getWeekStartISOString(wednesday),
      getWeekStartISOString(thursday),
      getWeekStartISOString(friday),
      getWeekStartISOString(saturday),
      getWeekStartISOString(sunday),
      getWeekStartISOString(mondayNextWeek),
      getWeekStartISOString(tuesdayNextWeek),
    ];

    expect(result).toEqual([
      monday,
      monday,
      monday,
      monday,
      monday,
      monday,
      monday,
      mondayNextWeek,
      mondayNextWeek,
    ]);
  });
});
