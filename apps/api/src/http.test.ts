import assert from 'node:assert/strict'
import test from 'node:test'
import type { Request, Response, NextFunction } from 'express'
import { requireAuth, requireRole } from './http.js'

function responseDouble() {
  const response = {
    statusCode: 200,
    body: undefined as unknown,
    status(code: number) { this.statusCode = code; return this },
    json(body: unknown) { this.body = body; return this },
  }
  return response
}

test('protected requests reject anonymous users', () => {
  const response = responseDouble()
  let advanced = false
  requireAuth({ requestId: 'test' } as Request, response as unknown as Response, (() => { advanced = true }) as NextFunction)
  assert.equal(response.statusCode, 401)
  assert.equal(advanced, false)
})

test('operator cannot enter an admin-only route', () => {
  const response = responseDouble()
  let advanced = false
  const middleware = requireRole('admin')
  middleware({ requestId: 'test', auth: { role: 'operator' } } as unknown as Request, response as unknown as Response, (() => { advanced = true }) as NextFunction)
  assert.equal(response.statusCode, 403)
  assert.equal(advanced, false)
})

test('admin can enter an admin-only route', () => {
  const response = responseDouble()
  let advanced = false
  const middleware = requireRole('admin')
  middleware({ requestId: 'test', auth: { role: 'admin' } } as unknown as Request, response as unknown as Response, (() => { advanced = true }) as NextFunction)
  assert.equal(response.statusCode, 200)
  assert.equal(advanced, true)
})
