const crypto = require('crypto');

function generateTokenId() {
  return crypto.randomUUID();
}

function sha256(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

module.exports = { generateTokenId, sha256 };
