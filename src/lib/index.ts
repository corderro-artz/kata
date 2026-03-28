import type { ParsedDocument } from './types'

export interface SearchHit {
  nodeId: number
  field: 'key' | 'value' | 'label'
  offset: number
  length: number
}

export interface NodeIndex {
  /** lowercase key → node ids for O(1) lookup */
  keyMap: Map<string, number[]>
  /** lowercase value → node ids */
  valueMap: Map<string, number[]>
  /** parent id → node id (precomputed for fast path traversal) */
  parentMap: Uint32Array
  /** combined lowercase text per node for search */
  searchText: string[]
}

export function buildNodeIndex(doc: ParsedDocument): NodeIndex {
  const nodes = doc.nodes
  const count = nodes.length
  const keyMap = new Map<string, number[]>()
  const valueMap = new Map<string, number[]>()
  const parentMap = new Uint32Array(count)
  const searchText: string[] = new Array(count)

  for (let i = 0; i < count; i++) {
    const node = nodes[i]

    // key index
    if (node.key !== null) {
      const lower = node.key.toLowerCase()
      const existing = keyMap.get(lower)
      if (existing) {
        existing.push(node.id)
      } else {
        keyMap.set(lower, [node.id])
      }
    }

    // value index
    if (node.value !== null) {
      const lower = node.value.toLowerCase()
      const existing = valueMap.get(lower)
      if (existing) {
        existing.push(node.id)
      } else {
        valueMap.set(lower, [node.id])
      }
    }

    // parent map (precompute parent → child relationship for fast path building)
    for (let c = node.childStart; c < node.childEnd; c++) {
      const childId = doc.childIds[c]
      parentMap[childId] = node.id
    }

    // combined search text: "key label value"
    const parts: string[] = []
    if (node.key !== null) parts.push(node.key)
    if (node.label) parts.push(node.label)
    if (node.value !== null) parts.push(node.value)
    searchText[i] = parts.join(' ').toLowerCase()
  }

  return { keyMap, valueMap, parentMap, searchText }
}

export function searchNodes(
  doc: ParsedDocument,
  index: NodeIndex,
  query: string,
  maxResults = 200,
): SearchHit[] {
  if (!query) return []

  const lower = query.toLowerCase()
  const hits: SearchHit[] = []
  const nodes = doc.nodes

  for (let i = 0; i < nodes.length && hits.length < maxResults; i++) {
    const text = index.searchText[i]
    if (text.indexOf(lower) === -1) continue

    const node = nodes[i]

    // determine which field matched
    if (node.key !== null && node.key.toLowerCase().indexOf(lower) !== -1) {
      hits.push({ nodeId: node.id, field: 'key', offset: node.key.toLowerCase().indexOf(lower), length: lower.length })
    } else if (node.value !== null && node.value.toLowerCase().indexOf(lower) !== -1) {
      hits.push({ nodeId: node.id, field: 'value', offset: node.value.toLowerCase().indexOf(lower), length: lower.length })
    } else {
      hits.push({ nodeId: node.id, field: 'label', offset: node.label.toLowerCase().indexOf(lower), length: lower.length })
    }
  }

  return hits
}

export function buildPathFromIndex(doc: ParsedDocument, index: NodeIndex, nodeId: number): string {
  const segments: string[] = []
  let current = nodeId
  while (current !== doc.rootId) {
    segments.unshift(doc.nodes[current].label)
    current = index.parentMap[current]
  }
  return segments.join('.')
}

/* -- Reference Linking (Stage 9.2) -- */

export interface ReferenceEdge {
  sourceId: number
  targetId: number
  kind: 'ref' | 'id' | 'path'
}

const REF_KEYS = new Set(['$ref', '$id', '@id', 'id', '$type', 'type'])
const PATH_PREFIX = '#/'

export function detectReferences(doc: ParsedDocument, index: NodeIndex): ReferenceEdge[] {
  const edges: ReferenceEdge[] = []
  const nodes = doc.nodes

  // Build a path → nodeId map for resolving JSON Pointer-style refs
  const pathMap = new Map<string, number>()
  for (let i = 0; i < nodes.length; i++) {
    const path = buildPathFromIndex(doc, index, i)
    if (path) pathMap.set(path, i)
  }

  // Collect id → nodeId mapping from nodes that define an "id", "$id", or "@id"
  const idTargets = new Map<string, number>()
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i]
    if (node.key !== null && (node.key === 'id' || node.key === '$id' || node.key === '@id') && node.value !== null) {
      idTargets.set(node.value, index.parentMap[i])
    }
  }

  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i]
    if (node.key === null || node.value === null) continue
    const keyLower = node.key.toLowerCase()

    if (!REF_KEYS.has(keyLower)) continue

    const value = node.value

    // JSON Pointer ref: "#/definitions/Foo" → resolve path
    if (value.startsWith(PATH_PREFIX)) {
      const refPath = value.slice(PATH_PREFIX.length).replaceAll('/', '.')
      const targetId = pathMap.get(refPath)
      if (targetId !== undefined && targetId !== i) {
        edges.push({ sourceId: index.parentMap[i], targetId, kind: 'ref' })
      }
      continue
    }

    // ID-based ref: "$ref": "SomeId" → match against collected ids
    if (keyLower === '$ref' || keyLower === '$type' || keyLower === 'type') {
      const target = idTargets.get(value)
      if (target !== undefined && target !== index.parentMap[i]) {
        edges.push({ sourceId: index.parentMap[i], targetId: target, kind: 'id' })
      }
    }
  }

  return edges
}
