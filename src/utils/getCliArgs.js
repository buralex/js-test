/**
 * Utility function to get command-line arguments as an array
 */
function getCliArgs() {
  return process.argv.slice(2); // Slice to exclude first two elements (node executable and script path)
}

module.exports = { getCliArgs };
