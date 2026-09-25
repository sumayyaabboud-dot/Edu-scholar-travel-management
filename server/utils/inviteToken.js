const crypto = require('crypto');

function generateInviteToken() {
  const token = crypto.randomBytes(32).toString('hex');
  const expires = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48 hours
  return { token, expires };
}

module.exports = { generateInviteToken };