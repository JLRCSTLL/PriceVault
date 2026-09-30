import { test } from 'node:test'
import assert from 'node:assert/strict'
import { priceStatus } from '../src/lib/priceStatus.ts'

test('price status follows expiry without overwriting No Offer or EOL', () => {
  const now = Date.parse('2026-09-29T00:00:00Z')
  assert.equal(priceStatus('Active', '2026-09-28', now), 'Expired')
  assert.equal(priceStatus('Active', '2026-10-01', now), 'Expiring Soon')
  assert.equal(priceStatus('Expired', '2026-11-01', now), 'Active')
  assert.equal(priceStatus('No Offer', '2026-09-28', now), 'No Offer')
  assert.equal(priceStatus('EOL', '2026-09-28', now), 'EOL')
})
