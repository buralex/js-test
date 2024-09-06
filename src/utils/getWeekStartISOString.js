/**
 * Get the ISO date string that represents the start of the week (Monday)
 */
function getWeekStartISOString(dateStr) {
  const date = new Date(dateStr);
  const day = date.getDay();
  const diff = (day === 0 ? -6 : 1) - day; // Adjusting to Monday
  const weekStart = new Date(date.setDate(date.getDate() + diff));
  return weekStart.toISOString().split('T')[0]; // Format as YYYY-MM-DD
}

module.exports = { getWeekStartISOString };
