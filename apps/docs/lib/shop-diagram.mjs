export const nodeWidth = 360
export const canvasPadding = 48
export function nodeHeight(table) {
  return 50 + Math.max(1, table.columns.length) * 24
}
export function columnY(table, column, position) {
  const index = table.columns.findIndex((c) => c.name === column)
  if (index < 0) throw new Error(`Unknown column: ${table.name}.${column}`)
  return position.y + 57 + index * 24
}

// Keep the two shared hubs (SKU and order) beside their dependants. Authentication
// follows the customer, then the separate admin and unconnected support tables.
const rows = [
  ['categories', 'products', 'skus', 'cart_items'],
  ['inventory_movements', 'shipments', 'inventory_reservations', 'app_auth__account'],
  ['notifications', 'orders', 'payments', 'app_auth__user'],
  ['order_items', 'refund_items', 'refunds', 'carts'],
  ['app_auth__session', 'admin_auth__session', 'admin_auth__user', 'admin_auth__account'],
  ['webhook_events', 'audit_logs', 'app_auth__verification', 'admin_auth__verification'],
  ['media_assets', 'commerce_revision'],
]
export function initialPositions(tables) {
  const byName = new Map(tables.map((t) => [t.name, t]))
  const ordered = rows.map((row) => row.filter((name) => byName.has(name)))
  const known = new Set(rows.flat())
  const extra = tables
    .filter((t) => !known.has(t.name))
    .map((t) => t.name)
    .sort()
  for (let i = 0; i < extra.length; i += 4) ordered.push(extra.slice(i, i + 4))
  const positions = {}
  let y = canvasPadding
  for (const row of ordered.filter((r) => r.length)) {
    row.forEach((name, col) => {
      positions[name] = { x: canvasPadding + col * (nodeWidth + 112), y }
    })
    y += Math.max(...row.map((name) => nodeHeight(byName.get(name)))) + 112
  }
  return positions
}
export function schemaEdges(tables) {
  const byName = new Map(tables.map((t) => [t.name, t]))
  return tables.flatMap((t) =>
    t.foreignKeys.flatMap((f) =>
      f.columns.map((column, i) => {
        const target = f.targetColumns[i]
        if (
          !t.columns.some((c) => c.name === column) ||
          !byName.get(f.targetTable)?.columns.some((c) => c.name === target)
        )
          throw new Error('Unresolved schema relationship')
        return {
          id: `${t.name}.${column}:${f.targetTable}.${target}`,
          source: t.name,
          column,
          target: f.targetTable,
          targetColumn: target,
        }
      })
    )
  )
}
const rectangle = (table, positions, padding = 0) => ({
  left: positions[table.name].x - padding,
  right: positions[table.name].x + nodeWidth + padding,
  top: positions[table.name].y - padding,
  bottom: positions[table.name].y + nodeHeight(table) + padding,
})
export function movePosition(tables, positions, id, x, y) {
  const next = {
    ...positions,
    [id]: { x: Math.max(canvasPadding, x), y: Math.max(canvasPadding, y) },
  }
  const moving = rectangle(
    tables.find((t) => t.name === id),
    next,
    40
  )
  // Keep enough room for ports even when dragging directly onto another table.
  if (
    tables.some((t) => {
      if (t.name === id) return false
      const r = rectangle(t, next)
      return (
        moving.left < r.right &&
        moving.right > r.left &&
        moving.top < r.bottom &&
        moving.bottom > r.top
      )
    })
  )
    return positions
  return next
}

class Queue {
  items = []
  push(item) {
    const a = this.items
    let i = a.length
    a.push(item)
    while (i && a[(i - 1) >> 1].score > item.score) {
      a[i] = a[(i - 1) >> 1]
      i = (i - 1) >> 1
    }
    a[i] = item
  }
  pop() {
    const a = this.items,
      first = a[0],
      last = a.pop()
    if (a.length) {
      let i = 0
      while (i * 2 + 1 < a.length) {
        let j = i * 2 + 1
        if (j + 1 < a.length && a[j + 1].score < a[j].score) j++
        if (a[j].score >= last.score) break
        a[i] = a[j]
        i = j
      }
      a[i] = last
    }
    return first
  }
}
const distance = (a, b) => Math.abs(a.x - b.x) + Math.abs(a.y - b.y)
const segmentKey = (a, b) => (a < b ? `${a}:${b}` : `${b}:${a}`)
function simplify(points) {
  return points.filter((p, i) => {
    const a = points[i - 1],
      b = points[i + 1]
    return !a || !b || !((a.x === p.x && p.x === b.x) || (a.y === p.y && p.y === b.y))
  })
}

// A rectilinear visibility grid includes every port and both sides of each
// obstacle. A* penalizes bends, shared tracks and crossings, and never enters
// a padded table. Rebuilding it also reroutes unrelated edges around moved nodes.
export function routeEdges(tables, positions) {
  const edges = schemaEdges(tables).sort(
    (a, b) =>
      positions[a.source].y - positions[b.source].y || positions[a.source].x - positions[b.source].x
  )
  const byName = new Map(tables.map((t) => [t.name, t]))
  const obstacles = tables.map((t) => rectangle(t, positions, 12))
  const xs = new Set([16]),
    ys = new Set([16])
  for (const t of tables) {
    const r = rectangle(t, positions)
    for (const x of [
      r.left - 44,
      r.left - 32,
      r.left - 20,
      r.right + 20,
      r.right + 32,
      r.right + 44,
    ])
      xs.add(x)
    ys.add(r.top - 36)
    ys.add(r.bottom + 36)
    ys.add(r.top - 24)
    ys.add(r.bottom + 24)
  }
  const ports = new Map()
  for (const edge of edges)
    for (const key of [`${edge.source}.${edge.column}`, `${edge.target}.${edge.targetColumn}`]) {
      if (!ports.has(key)) ports.set(key, [])
      ports.get(key).push(edge.id)
    }
  const ends = edges.map((edge) => {
    const endpoint = (name, column) => {
      const p = positions[name],
        connections = ports.get(`${name}.${column}`),
        offset =
          (connections.indexOf(edge.id) - (connections.length - 1) / 2) *
          Math.min(3, 16 / Math.max(1, connections.length - 1)),
        y = columnY(byName.get(name), column, p) + offset
      ys.add(y)
      return [-1, 1].map((side) => ({
        x: p.x + (side === 1 ? nodeWidth : 0),
        y,
        side,
      }))
    }
    return {
      start: endpoint(edge.source, edge.column),
      end: endpoint(edge.target, edge.targetColumn),
    }
  })
  const xList = [...xs].sort((a, b) => a - b),
    yList = [...ys].sort((a, b) => a - b)
  const nx = xList.length
  const points = yList.flatMap((y) => xList.map((x) => ({ x, y })))
  const free = points.map(
    (p) => !obstacles.some((r) => p.x > r.left && p.x < r.right && p.y > r.top && p.y < r.bottom)
  )
  const neighbors = points.map((p, i) => {
    if (!free[i]) return []
    return [i % nx ? i - 1 : -1, i % nx < nx - 1 ? i + 1 : -1, i - nx, i + nx]
      .filter((j) => j >= 0 && j < points.length && free[j])
      .filter(
        (j) =>
          !obstacles.some((r) => {
            const q = points[j]
            return p.y === q.y
              ? p.y > r.top &&
                  p.y < r.bottom &&
                  Math.max(p.x, q.x) > r.left &&
                  Math.min(p.x, q.x) < r.right
              : p.x > r.left &&
                  p.x < r.right &&
                  Math.max(p.y, q.y) > r.top &&
                  Math.min(p.y, q.y) < r.bottom
          })
      )
  })
  const index = (p) => yList.indexOf(p.y) * nx + xList.indexOf(p.x + p.side * 20)
  const used = new Map(),
    through = new Map()
  // Short links claim tracks first; longer links take remaining corridors.
  const order = edges
    .map((_, i) => i)
    .sort(
      (a, b) =>
        distance(positions[edges[a].source], positions[edges[a].target]) -
          distance(positions[edges[b].source], positions[edges[b].target]) ||
        edges[a].id.localeCompare(edges[b].id)
    )
  const routes = new Array(edges.length)
  for (const i of order) {
    const { start, end } = ends[i],
      goals = end.map(index)
    const costs = new Float64Array(points.length * 2).fill(Infinity)
    const previous = new Int32Array(points.length * 2).fill(-1)
    const queue = new Queue()
    const heuristic = (p) => Math.min(...goals.map((g) => distance(p, points[g])))
    for (const port of start) {
      const id = index(port),
        state = id * 2
      if (!free[id]) continue
      costs[state] = 0
      queue.push({ state, cost: 0, score: heuristic(points[id]) })
    }
    let final = -1
    while (queue.items.length) {
      const current = queue.pop(),
        state = current.state,
        id = state >> 1,
        axis = state % 2
      if (current.cost !== costs[state]) continue
      if (goals.includes(id)) {
        final = state
        break
      }
      for (const next of neighbors[id]) {
        const nextAxis = points[id].y === points[next].y ? 0 : 1
        const length = distance(points[id], points[next])
        const cost =
          current.cost +
          length +
          (axis !== nextAxis ? 32 : 0) +
          (used.get(segmentKey(id, next)) || 0) * (length * 8 + 800) +
          ((through.get(next) || 0) & (nextAxis === 0 ? 2 : 1) ? 1200 : 0)
        const nextState = next * 2 + nextAxis
        if (cost >= costs[nextState]) continue
        costs[nextState] = cost
        previous[nextState] = state
        queue.push({ state: nextState, cost, score: cost + heuristic(points[next]) })
      }
    }
    if (final < 0) throw new Error(`No unobstructed route for ${edges[i].id}`)
    const path = []
    for (let state = final; state !== -1; state = previous[state]) path.push(state >> 1)
    path.reverse()
    for (let j = 1; j < path.length; j++) {
      const a = path[j - 1],
        b = path[j],
        key = segmentKey(a, b)
      used.set(key, (used.get(key) || 0) + 1)
      const axis = points[a].y === points[b].y ? 1 : 2
      through.set(a, (through.get(a) || 0) | axis)
      through.set(b, (through.get(b) || 0) | axis)
    }
    const firstPort = start.find((p) => index(p) === path[0])
    const lastPort = end.find((p) => index(p) === path.at(-1))
    const route = simplify([firstPort, ...path.map((id) => points[id]), lastPort])
    routes[i] = {
      ...edges[i],
      points: route,
      d: route.map((p, j) => `${j ? 'L' : 'M'} ${p.x} ${p.y}`).join(' '),
    }
  }
  return routes
}
