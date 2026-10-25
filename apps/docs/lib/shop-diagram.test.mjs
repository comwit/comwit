import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import {
  initialPositions,
  nodeHeight,
  nodeWidth,
  schemaEdges,
  routeEdges,
  columnY,
  movePosition,
} from './shop-diagram.mjs'
const { tables } = JSON.parse(readFileSync(new URL('./shop-reference.json', import.meta.url)))
test('actual schema begins in four non-overlapping columns', () => {
  const p = initialPositions(tables)
  assert.equal(new Set(Object.values(p).map((v) => v.x)).size, 4)
  assert.equal(p.products.y, p.skus.y)
  assert.equal(p.orders.y, p.app_auth__user.y)
  assert.equal(p.refunds.y, p.refund_items.y)
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

function verifyRoutes(positions) {
  const routes = routeEdges(tables, positions)
  assert.equal(routes.length, 23)
  for (const route of routes) {
    assert.match(route.d, /^M /)
    assert.doesNotMatch(route.d, /[CQ]/)
    const a = tables.find((t) => t.name === route.source)
    const b = tables.find((t) => t.name === route.target)
    assert.ok(Math.abs(route.points[0].y - columnY(a, route.column, positions[a.name])) <= 8)
    assert.ok(
      Math.abs(route.points.at(-1).y - columnY(b, route.targetColumn, positions[b.name])) <= 8
    )
    for (let i = 1; i < route.points.length; i++) {
      const p = route.points[i - 1],
        q = route.points[i]
      assert.ok(p.x === q.x || p.y === q.y, `${route.id}: diagonal`)
      for (const table of tables) {
        const r = positions[table.name]
        const intersects =
          p.y === q.y
            ? p.y > r.y &&
              p.y < r.y + nodeHeight(table) &&
              Math.max(p.x, q.x) > r.x &&
              Math.min(p.x, q.x) < r.x + nodeWidth
            : p.x > r.x &&
              p.x < r.x + nodeWidth &&
              Math.max(p.y, q.y) > r.y &&
              Math.min(p.y, q.y) < r.y + nodeHeight(table)
        assert.ok(!intersects, `${route.id} crosses ${table.name}`)
      }
    }
  }
  return routes
}
test('all declared foreign keys take orthogonal routes outside every full-column table', () => {
  verifyRoutes(initialPositions(tables))
})
test('moving a node reroutes connections and unrelated edges around its new bounds', () => {
  const positions = initialPositions(tables)
  const before = verifyRoutes(positions)
  const moved = movePosition(tables, positions, 'orders', 2100, 600)
  const after = verifyRoutes(moved)
  assert.notDeepEqual(
    before.map((r) => r.d),
    after.map((r) => r.d)
  )
  const unrelated = movePosition(tables, positions, 'media_assets', 1950, 48)
  verifyRoutes(unrelated)
  assert.equal(
    movePosition(tables, positions, 'orders', positions.skus.x, positions.skus.y),
    positions
  )
})
test('every column fits its node, including non-key and nullable columns', () => {
  const positions = initialPositions(tables)
  assert.equal(
    tables.reduce((n, t) => n + t.columns.length, 0),
    256
  )
  for (const table of tables)
    for (const column of table.columns) {
      const y = columnY(table, column.name, positions[table.name])
      assert.ok(y > positions[table.name].y + 40)
      assert.ok(y < positions[table.name].y + nodeHeight(table))
    }
})

test('docs metadata exactly matches the pinned Shop schema export and source hashes', () => {
  const source = new URL('../../../templates/shop/', import.meta.url)
  // This file lives in apps/docs/lib, so the repository root is three levels up.
  const pinned = JSON.parse(readFileSync(new URL('docs/shop-reference.json', source)))
  const docs = JSON.parse(readFileSync(new URL('./shop-reference.json', import.meta.url)))
  assert.deepEqual(docs.tables, pinned.tables)
  assert.deepEqual(docs.schemaFiles, pinned.schemaFiles)
  for (const [file, expected] of Object.entries(pinned.schemaFiles)) {
    assert.equal(
      createHash('sha256')
        .update(readFileSync(new URL(file, source)))
        .digest('hex'),
      expected,
      file
    )
  }
})

test('initial relationship layout gives each edge a separate track', () => {
  const routes = routeEdges(tables, initialPositions(tables))
  for (let i = 0; i < routes.length; i++)
    for (let j = i + 1; j < routes.length; j++) {
      for (let a = 1; a < routes[i].points.length; a++)
        for (let b = 1; b < routes[j].points.length; b++) {
          const [p, q] = routes[i].points.slice(a - 1, a + 1)
          const [u, v] = routes[j].points.slice(b - 1, b + 1)
          const horizontal = p.y === q.y
          if (horizontal !== (u.y === v.y)) continue
          if (horizontal ? p.y !== u.y : p.x !== u.x) continue
          const axis = horizontal ? 'x' : 'y'
          const overlap =
            Math.min(Math.max(p[axis], q[axis]), Math.max(u[axis], v[axis])) -
            Math.max(Math.min(p[axis], q[axis]), Math.min(u[axis], v[axis]))
          assert.ok(overlap <= 0, `${routes[i].id} shares a track with ${routes[j].id}`)
        }
    }
})
