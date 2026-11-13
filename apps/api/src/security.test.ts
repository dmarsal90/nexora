import assert from 'node:assert/strict'
import { createHmac } from 'node:crypto'
import test from 'node:test'
import { decryptSecret, digest, encryptSecret, hashPassword, newTotpSecret, verifyPassword, verifyTotp } from '@nexora/security'

test('TOTP accepts the current code and rejects malformed input', () => {
  const secret = newTotpSecret()
  const now = 1_700_000_000_000
  const step = Math.floor(now / 30_000)
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'
  const bits = [...secret].map((char) => alphabet.indexOf(char).toString(2).padStart(5, '0')).join('')
  const key = Buffer.from(bits.match(/.{8}/gu)!.map((part) => Number.parseInt(part, 2)))
  const counter = Buffer.alloc(8)
  counter.writeBigUInt64BE(BigInt(step))
  const digestBytes = createHmac('sha1', key).update(counter).digest()
  const offset = digestBytes[digestBytes.length - 1]! & 0x0f
  const code = String((digestBytes.readUInt32BE(offset) & 0x7fffffff) % 1_000_000).padStart(6, '0')
  assert.equal(verifyTotp(secret, code, now), true)
  assert.equal(verifyTotp(secret, '12x456', now), false)
})

test('AES-GCM secret encryption round trips and detects tampering', () => {
  const key = 'a'.repeat(64)
  const ciphertext = encryptSecret('sensitive test value', key)
  assert.equal(decryptSecret(ciphertext, key), 'sensitive test value')
  assert.throws(() => decryptSecret(`${ciphertext.slice(0, -1)}x`, key))
})

test('password hashing verifies only the supplied password', async () => {
  const password = 'a-long-test-password-42'
  const hash = await hashPassword(password)
  assert.equal(hash.startsWith('$argon2id$'), true)
  assert.equal(await verifyPassword(hash, password), true)
  assert.equal(await verifyPassword(hash, 'a-different-password'), false)
})

test('session tokens are one-way digested', () => {
  assert.match(digest('opaque-session-token'), /^[a-f\d]{64}$/u)
  assert.notEqual(digest('opaque-session-token'), 'opaque-session-token')
})
