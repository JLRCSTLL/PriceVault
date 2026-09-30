import { test } from 'node:test'
import assert from 'node:assert/strict'
import XLSX from 'xlsx'
import { parsePriceWorkbook, extractReqstNumber } from '../src/lib/importPrices.ts'

const workbook = rows => { const w = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(w, XLSX.utils.aoa_to_sheet(rows), 'Prices'); return w }
test('preserves zero prices, zero quantity, metadata and physical row numbers', () => {
  const rows = parsePriceWorkbook(workbook([['Title'], [], ['Item No.', 'Inventory', 'Description', 'Order Qty.', 'VAR/PER UNIT', ' Warranty Information', 'REMARKS'], [1, 'A', 'Extron SM 26', 0, 0, '2 Years', 'C/O Microdata']]))
  assert.equal(rows[0].row, 4); assert.equal(rows[0].orderQty, 0); assert.equal(rows[0].status, 'No Offer'); assert.equal(rows[0].warrantyInformation, '2 Years'); assert.equal(rows[0].remarks, 'C/O Microdata')
})
test('currency values and EWS totals are not confused with unit SRP', () => {
  const [row] = parsePriceWorkbook(workbook([['Brand','Model','Specification','Unit Price','Total Price'],['Acme','X','Monitor','₱ 1,200.50',6002.5]]))
  assert.equal(row.varPrice,1200.5); assert.equal(row.srpPrice,0)
})
test('invalid numbers and unsupported files produce useful errors', () => {
  assert.throws(() => parsePriceWorkbook(workbook([['Item','Description','VAR'],[1,'Monitor','oops']])), /row 2: invalid/)
  assert.throws(() => parsePriceWorkbook(workbook([['unrelated']])), /No inventory rows/)
})
test('copy suffix does not change request identity', () => {
  assert.equal(extractReqstNumber('REQST002450 (1).xlsx'), 'REQST-002450')
})
test('reads matching sheets after a cover sheet and skips footer text', () => {
  const w = workbook([['Cover']]); XLSX.utils.book_append_sheet(w, XLSX.utils.aoa_to_sheet([['Item','Description','VAR'],[1,'Monitor',10],['This part is to be fill-up sales'],[2,'Not inventory',20]]), 'Data')
  assert.equal(parsePriceWorkbook(w).length,1)
})

if (process.env.PRICEVAULT_SAMPLE_DIR) {
  for (const [file, count] of [['REQST003056.xlsx',1],['REQST002598.xlsx',1],['REQST002450.xlsx',14],['REQST002450 (1).xlsx',14]]) {
    test(`attached workbook: ${file}`, () => {
      const rows = parsePriceWorkbook(XLSX.readFile(`${process.env.PRICEVAULT_SAMPLE_DIR}/${file}`))
      assert.equal(rows.length,count)
      assert.equal(rows[0].row,5)
      if (count === 14) { assert.equal(rows.filter(r => r.status === 'No Offer').length,8); assert.equal(rows[12].orderQty,0); assert.equal(rows[3].varPrice,109400) }
      if (file === 'REQST003056.xlsx') { assert.equal(rows[0].orderQty,6); assert.equal(rows[0].varPrice,20100) }
    })
  }
}
