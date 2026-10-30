import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { initialPositions, nodeHeight, nodeWidth, routeEdges } from './shop-diagram.mjs'
import { courseRows } from './course-diagram.mjs'
const { tables } = JSON.parse(readFileSync(new URL('./course-reference.json', import.meta.url)))

test('the course layout names every table once in four columns without overlap', () => {
  assert.deepEqual(courseRows.flat().sort(), tables.map((t) => t.name).sort())
  const p = initialPositions(tables, courseRows)
  assert.equal(new Set(Object.values(p).map((v) => v.x)).size, 4)
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

test('course foreign keys take orthogonal routes outside every table', () => {
  const positions = initialPositions(tables, courseRows)
  const routes = routeEdges(tables, positions)
  assert.equal(
    routes.length,
    tables.reduce((n, t) => n + t.foreignKeys.reduce((n, f) => n + f.columns.length, 0), 0)
  )
  for (const route of routes)
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
})

test('docs metadata exactly matches the pinned Course schema export and source hashes', () => {
  const source = new URL('../../../templates/course/', import.meta.url)
  const pinned = JSON.parse(readFileSync(new URL('docs/course-reference.json', source)))
  const docs = JSON.parse(readFileSync(new URL('./course-reference.json', import.meta.url)))
  assert.deepEqual(docs.tables, pinned.tables)
  assert.deepEqual(docs.routes, pinned.routes)
  assert.deepEqual(docs.schemaFiles, pinned.schemaFiles)
  for (const [file, expected] of Object.entries(pinned.schemaFiles))
    assert.equal(
      createHash('sha256')
        .update(readFileSync(new URL(file, source)))
        .digest('hex'),
      expected,
      file
    )
  assert.equal(docs.admin.length, 4)
})

test('the initial course layout gives each edge a separate track', () => {
  const routes = routeEdges(tables, initialPositions(tables, courseRows))
  for (let i = 0; i < routes.length; i++)
    for (let j = i + 1; j < routes.length; j++)
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
})
