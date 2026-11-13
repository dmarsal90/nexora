import { createCipheriv, createDecipheriv, createHash, createHmac, randomBytes, timingSafeEqual } from 'node:crypto'
import argon2 from 'argon2'

const base32Alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'

export function randomToken(bytes = 32) {
  return randomBytes(bytes).toString('base64url')
}

export function digest(value: string) {
  return createHash('sha256').update(value).digest('hex')
}

export async function hashPassword(password: string) {
  return argon2.hash(password, {
    type: argon2.argon2id,
    memoryCost: 19_456,
    timeCost: 2,
    parallelism: 1,
  })
}

export async function verifyPassword(hash: string, password: string) {
  try {
    return await argon2.verify(hash, password)
  } catch {
    return false
  }
}

function decodeBase32(value: string) {
  const clean = value.replace(/=+$/u, '').toUpperCase()
  let bits = ''
  for (const char of clean) {
    const index = base32Alphabet.indexOf(char)
    if (index < 0) throw new Error('Invalid base32 secret')
    bits += index.toString(2).padStart(5, '0')
  }
  const bytes: number[] = []
  for (let offset = 0; offset + 8 <= bits.length; offset += 8) {
    bytes.push(Number.parseInt(bits.slice(offset, offset + 8), 2))
  }
  return Buffer.from(bytes)
}

function encodeBase32(value: Buffer) {
  let bits = ''
  for (const byte of value) bits += byte.toString(2).padStart(8, '0')
  let result = ''
  for (let offset = 0; offset < bits.length; offset += 5) {
    result += base32Alphabet[Number.parseInt(bits.slice(offset, offset + 5).padEnd(5, '0'), 2)]
  }
  return result
}

export function newTotpSecret() {
  return encodeBase32(randomBytes(20))
}

export function makeOtpAuthUrl(secret: string, account: string, issuer = 'Nexora') {
  const label = encodeURIComponent(`${issuer}:${account}`)
  const params = new URLSearchParams({ secret, issuer, algorithm: 'SHA1', digits: '6', period: '30' })
  return `otpauth://totp/${label}?${params.toString()}`
}

export function verifyTotp(secret: string, code: string, now = Date.now()) {
  if (!/^\d{6}$/u.test(code)) return false
  const key = decodeBase32(secret)
  const counter = Math.floor(now / 30_000)
  for (let drift = -1; drift <= 1; drift += 1) {
    const message = Buffer.alloc(8)
    message.writeBigUInt64BE(BigInt(counter + drift))
    const digestBytes = createHmac('sha1', key).update(message).digest()
    const offset = digestBytes[digestBytes.length - 1]! & 0x0f
    const binary = digestBytes.readUInt32BE(offset) & 0x7fffffff
    const expected = String(binary % 1_000_000).padStart(6, '0')
    if (timingSafeEqual(Buffer.from(expected), Buffer.from(code))) return true
  }
  return false
}

export function encryptSecret(plaintext: string, keyHex: string) {
  const key = Buffer.from(keyHex, 'hex')
  if (key.length !== 32) throw new Error('ENCRYPTION_KEY must be 32 bytes encoded as 64 hex characters')
  const iv = randomBytes(12)
  const cipher = createCipheriv('aes-256-gcm', key, iv)
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()])
  return [iv, cipher.getAuthTag(), encrypted].map((part) => part.toString('base64url')).join('.')
}

export function decryptSecret(ciphertext: string, keyHex: string) {
  const key = Buffer.from(keyHex, 'hex')
  if (key.length !== 32) throw new Error('ENCRYPTION_KEY must be 32 bytes encoded as 64 hex characters')
  const [ivText, tagText, dataText] = ciphertext.split('.')
  if (!ivText || !tagText || dataText === undefined) throw new Error('Invalid encrypted secret')
  const decipher = createDecipheriv('aes-256-gcm', key, Buffer.from(ivText, 'base64url'))
  decipher.setAuthTag(Buffer.from(tagText, 'base64url'))
  return Buffer.concat([decipher.update(Buffer.from(dataText, 'base64url')), decipher.final()]).toString('utf8')
}
