const { getCliArgs } = require('./utils/getCliArgs');
const { readJsonFile } = require('./utils/readJsonFile');

async function getInputData() {
  const cliArgs = getCliArgs();
  const inputDataPath = cliArgs[0];
  if (!inputDataPath) {
    console.error('❌ Please provide the path to the input file');
    process.exit(1);
  }
  const data = await readJsonFile(inputDataPath);
  return data;
}

module.exports = { getInputData };
