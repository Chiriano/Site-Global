const fs = require('fs');
const path = require('path');

const dataRoot = path.resolve(__dirname, '..', '.data');

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function getJsonPath(namespace) {
  ensureDir(dataRoot);
  return path.join(dataRoot, `${namespace}.json`);
}

function readCollection(namespace) {
  const target = getJsonPath(namespace);
  if (!fs.existsSync(target)) {
    return [];
  }

  try {
    const raw = fs.readFileSync(target, 'utf8');
    if (!raw.trim()) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error(`[modules.storage] Falha ao ler ${namespace}:`, error.message);
    return [];
  }
}

function writeCollection(namespace, records) {
  const target = getJsonPath(namespace);
  const payload = JSON.stringify(records, null, 2);
  fs.writeFileSync(target, payload, 'utf8');
}

function upsert(namespace, matcher, nextRecord) {
  const current = readCollection(namespace);
  const index = current.findIndex(matcher);
  if (index === -1) {
    current.push(nextRecord);
  } else {
    current[index] = nextRecord;
  }
  writeCollection(namespace, current);
  return nextRecord;
}

module.exports = {
  ensureDir,
  readCollection,
  writeCollection,
  upsert,
};
