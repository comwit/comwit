'use client'
import { Button } from '@comwit/ui-templates/button'
import { Input } from '@comwit/ui-templates/input'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocale } from 'next-intl'
import reference from '@/lib/shop-reference.json'
import {
  initialPositions,
  canvasPadding,
  movePosition,
  routeEdges,
  nodeHeight,
  nodeWidth,
} from '@/lib/shop-diagram.mjs'
type Position = { x: number; y: number }
type Column = { name: string; type: string; nullable: boolean; primaryKey: boolean }
const layout = initialPositions(reference.tables) as Record<string, Position>
const tables = [...reference.tables].sort(
  (a, b) => layout[a.name].y - layout[b.name].y || layout[a.name].x - layout[b.name].x
)
export function ShopSchema() {
  const ko = useLocale() === 'ko'
  const initial = useMemo(() => initialPositions(tables) as Record<string, Position>, [])
  const [positions, setPositions] = useState(initial)
  const [selected, setSelected] = useState<string | null>(null)
  const [zoom, setZoom] = useState(0.7)
  const [search, setSearch] = useState('')
  const host = useRef<HTMLDivElement>(null)
  const drag = useRef<{ id: string; startX: number; startY: number; origin: Position } | null>(null)
  const edges = useMemo(
    () =>
      routeEdges(tables, positions) as {
        id: string
        source: string
        target: string
        column: string
        targetColumn: string
        d: string
      }[],
    [positions]
  )
  const initialWidth = Math.max(
    ...Object.values(initial).map((p) => p.x + nodeWidth + canvasPadding)
  )
  useEffect(() => {
    if (host.current)
      setZoom(
        host.current.clientWidth < 640
          ? 0.8
          : Math.min(1, (host.current.clientWidth - 16) / initialWidth)
      )
  }, [initialWidth])
  const width = Math.max(
    initialWidth,
    ...Object.values(positions).map((p) => p.x + nodeWidth + canvasPadding)
  )
  const height = Math.max(...tables.map((t) => positions[t.name].y + nodeHeight(t) + canvasPadding))
  const active = tables.find((t) => t.name === selected)
  const move = (id: string, x: number, y: number) =>
    setPositions((p) => movePosition(tables, p, id, x, y))
  return (
    <section
      className="shop-schema not-prose"
      aria-label={ko ? '데이터 구조 관계도' : 'Database relationships'}
    >
      <div className="shop-schema-toolbar">
        <label>
          {ko ? '테이블' : 'Table'}{' '}
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={ko ? '이름 검색' : 'Search by name'}
          />
        </label>
        <div>
          <Button
            variant="plain"
            size="none"
            type="button"
            aria-label={ko ? '축소' : 'Zoom out'}
            onClick={() => setZoom((z) => Math.max(0.3, z - 0.1))}
          >
            −
          </Button>
          <output>{Math.round(zoom * 100)}%</output>
          <Button
            variant="plain"
            size="none"
            type="button"
            aria-label={ko ? '확대' : 'Zoom in'}
            onClick={() => setZoom((z) => Math.min(1.5, z + 0.1))}
          >
            +
          </Button>
          <Button
            variant="plain"
            size="none"
            type="button"
            onClick={() => {
              setPositions(initial)
              setSelected(null)
            }}
          >
            {ko ? '4열로 정렬' : 'Reset four columns'}
          </Button>
        </div>
      </div>
      <p className="shop-reference-note">
        {ko
          ? '노드 제목을 드래그하거나, 제목에 포커스 후 방향키로 이동하세요. 선택하면 외래키 연결을 볼 수 있습니다.'
          : 'Drag a node heading, or focus it and use arrow keys. Select a table to inspect its foreign keys.'}
      </p>
      <div
        ref={host}
        className="shop-schema-viewport"
        tabIndex={0}
        aria-label={ko ? '관계도 스크롤 영역' : 'Scrollable relationship diagram'}
      >
        <div style={{ width: width * zoom, height: height * zoom }}>
          <div
            className="shop-schema-canvas"
            style={{ width, height, transform: `scale(${zoom})` }}
          >
            <svg width={width} height={height} aria-hidden="true">
              <defs>
                <marker
                  id="shop-fk-arrow"
                  viewBox="0 0 10 10"
                  refX="9"
                  refY="5"
                  markerWidth="5"
                  markerHeight="5"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="currentColor" />
                </marker>
              </defs>
              {edges.map((edge) => {
                const highlighted = selected === edge.source || selected === edge.target
                return (
                  <path
                    key={edge.id}
                    d={edge.d}
                    data-edge={edge.id}
                    fill="none"
                    markerEnd="url(#shop-fk-arrow)"
                    className={highlighted ? 'is-active' : ''}
                  />
                )
              })}
            </svg>
            {tables.map((table) => {
              const point = positions[table.name],
                rows = table.columns as Column[]
              return (
                <div
                  key={table.name}
                  className="shop-schema-node"
                  data-table={table.name}
                  data-selected={selected === table.name || undefined}
                  data-dimmed={
                    (search && !table.name.toLowerCase().includes(search.toLowerCase())) ||
                    undefined
                  }
                  style={{
                    left: point.x,
                    top: point.y,
                    width: nodeWidth,
                    height: nodeHeight(table),
                  }}
                >
                  <Button
                    variant="plain"
                    size="none"
                    type="button"
                    aria-pressed={selected === table.name}
                    onClick={() => setSelected(table.name)}
                    onPointerDown={(e) => {
                      if (e.button !== 0) return
                      e.currentTarget.setPointerCapture(e.pointerId)
                      drag.current = {
                        id: table.name,
                        startX: e.clientX,
                        startY: e.clientY,
                        origin: point,
                      }
                      setSelected(table.name)
                    }}
                    onPointerMove={(e) => {
                      const d = drag.current
                      if (d?.id === table.name)
                        move(
                          d.id,
                          d.origin.x + (e.clientX - d.startX) / zoom,
                          d.origin.y + (e.clientY - d.startY) / zoom
                        )
                    }}
                    onPointerUp={() => {
                      drag.current = null
                    }}
                    onPointerCancel={() => {
                      drag.current = null
                    }}
                    onKeyDown={(e) => {
                      const delta: Record<string, [number, number]> = {
                        ArrowLeft: [-16, 0],
                        ArrowRight: [16, 0],
                        ArrowUp: [0, -16],
                        ArrowDown: [0, 16],
                      }
                      if (delta[e.key]) {
                        e.preventDefault()
                        move(table.name, point.x + delta[e.key][0], point.y + delta[e.key][1])
                      }
                    }}
                  >
                    {table.name}
                  </Button>
                  <ul>
                    {rows.length ? (
                      rows.map((column) => (
                        <li key={column.name}>
                          <span title={column.name}>{column.name}</span>
                          <small>{column.type}</small>
                          <small title={column.nullable ? 'NULL' : 'NOT NULL'}>
                            {column.nullable ? 'NULL' : 'NN'}
                          </small>
                          <small>
                            {[
                              column.primaryKey && 'PK',
                              table.foreignKeys.some((f) => f.columns.includes(column.name)) &&
                                'FK',
                            ]
                              .filter(Boolean)
                              .join('/') || '—'}
                          </small>
                        </li>
                      ))
                    ) : (
                      <li>
                        <span>
                          {table.columns.length} {ko ? '컬럼' : 'columns'}
                        </span>
                      </li>
                    )}
                  </ul>
                </div>
              )
            })}
          </div>
        </div>
      </div>
      <div className="shop-schema-inspector" aria-live="polite">
        {active ? (
          <>
            <h3>{active.name}</h3>
            <div className="shop-table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>{ko ? '컬럼' : 'Column'}</th>
                    <th>{ko ? '형식' : 'Type'}</th>
                    <th>NULL</th>
                    <th>{ko ? '키' : 'Key'}</th>
                  </tr>
                </thead>
                <tbody>
                  {active.columns.map((c) => (
                    <tr key={c.name}>
                      <td>
                        <code>{c.name}</code>
                      </td>
                      <td>{c.type}</td>
                      <td>{c.nullable ? 'YES' : 'NO'}</td>
                      <td>
                        {c.primaryKey
                          ? 'PK'
                          : active.foreignKeys.some((f) => f.columns.includes(c.name))
                            ? 'FK'
                            : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <ul>
              {active.foreignKeys.map((f) => (
                <li key={f.name}>
                  <code>
                    {f.columns.join(', ')} → {f.targetTable} ({f.targetColumns.join(', ')})
                  </code>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p>
            {ko
              ? '테이블을 선택하면 컬럼과 연결 관계가 표시됩니다.'
              : 'Select a table to inspect its columns and relationships.'}
          </p>
        )}
      </div>
      <details>
        <summary>
          {ko ? '전체 테이블 목록' : 'All tables'} ({tables.length})
        </summary>
        <ul>
          {tables.map((t) => (
            <li key={t.name}>
              <Button variant="plain" size="none" type="button" onClick={() => setSelected(t.name)}>
                {t.name}
              </Button>{' '}
              · {t.columns.length}
            </li>
          ))}
        </ul>
      </details>
    </section>
  )
}
