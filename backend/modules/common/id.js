const crypto = require('crypto');

function createId(prefix) {
  const stamp = Date.now().toString(36);
  const random = crypto.randomBytes(4).toString('hex');
  return `${prefix}_${stamp}_${random}`;
}

module.exports = {
  createId,
};
