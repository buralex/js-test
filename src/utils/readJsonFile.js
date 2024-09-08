const fs = require('fs/promises');

async function readJsonFile(filePath) {
  try {
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading or parsing file:', err);
    return null;
  }
}

module.exports = { readJsonFile };
