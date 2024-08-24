import crypto from 'crypto';

export function generateStateToken() {
  return crypto.randomBytes(32).toString('hex');
}
