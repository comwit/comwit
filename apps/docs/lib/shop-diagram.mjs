export const nodeWidth = 240
export function keyColumns(table) {
  return table.columns
    .filter((c) => c.primaryKey || table.foreignKeys.some((f) => f.columns.includes(c.name)))
    .slice(0, 7)
}
export function nodeHeight(table) {
  return 52 + Math.max(1, keyColumns(table).length) * 24
}
export function initialPositions(tables) {
  const positions = {}
  let y = 24
  for (let row = 0; row < tables.length; row += 4) {
    const group = tables.slice(row, row + 4)
    group.forEach((t, col) => {
      positions[t.name] = { x: 24 + col * 292, y }
    })
    y += Math.max(...group.map(nodeHeight)) + 64
  }
  return positions
}
export function schemaEdges(tables) {
  const byName = new Map(tables.map((t) => [t.name, t]))
  return tables.flatMap((t) =>
    t.foreignKeys.flatMap((f) =>
      f.columns.flatMap((column, i) => {
        const target = f.targetColumns[i]
        if (
          !byName.has(f.targetTable) ||
          !byName.get(f.targetTable).columns.some((c) => c.name === target)
        )
          throw new Error('Unresolved schema relationship')
        return [
          {
            id: `${t.name}.${column}:${f.targetTable}.${target}`,
            source: t.name,
            column,
            target: f.targetTable,
            targetColumn: target,
          },
        ]
      })
    )
  )
}
