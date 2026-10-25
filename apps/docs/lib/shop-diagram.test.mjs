import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { initialPositions, nodeHeight, nodeWidth, schemaEdges } from './shop-diagram.mjs'
const { tables } = JSON.parse(readFileSync(new URL('./shop-reference.json', import.meta.url)))
test('actual schema begins in four non-overlapping columns', () => {
  const p = initialPositions(tables)
  assert.equal(new Set(Object.values(p).map((v) => v.x)).size, 4)
  assert.equal(new Set(tables.slice(0, 4).map((t) => p[t.name].y)).size, 1)
  for (let i = 0; i < tables.length; i++)
    for (let j = i + 1; j < tables.length; j++) {
      const a = p[tables[i].name],
        b = p[tables[j].name]
      assert.ok(
        a.x + nodeWidth <= b.x ||
          b.x + nodeWidth <= a.x ||
          a.y + nodeHeight(tables[i]) <= b.y ||
          b.y + nodeHeight(tables[j]) <= a.y
      )
    }
})
test('diagram edges come only from actual foreign keys', () => {
  const edges = schemaEdges(tables)
  assert.equal(
    edges.length,
    tables.reduce((n, t) => n + t.foreignKeys.reduce((n, f) => n + f.columns.length, 0), 0)
  )
  assert.ok(
    edges.some(
      (e) => e.source === 'products' && e.column === 'category_id' && e.target === 'categories'
    )
  )
  assert.ok(edges.some((e) => e.source === 'order_items' && e.target === 'orders'))
  assert.throws(
    () =>
      schemaEdges([
        {
          name: 'bad',
          columns: [],
          foreignKeys: [{ columns: ['id'], targetTable: 'missing', targetColumns: ['id'] }],
        },
      ]),
    /Unresolved/
  )
})
