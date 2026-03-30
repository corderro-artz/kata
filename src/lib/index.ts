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
  /** lowercase key per node id */
  keyText: Array<string | null>
  /** lowercase value per node id */
  valueText: Array<string | null>
  /** lowercase label per node id */
  labelText: string[]
}

export function buildNodeIndex(doc: ParsedDocument): NodeIndex {
  const nodes = doc.nodes
  const count = nodes.length
  const keyMap = new Map<string, number[]>()
  const valueMap = new Map<string, number[]>()
  const parentMap = new Uint32Array(count)
  const searchText: string[] = new Array(count)
  const keyText: Array<string | null> = new Array(count)
  const valueText: Array<string | null> = new Array(count)
  const labelText: string[] = new Array(count)

  for (let i = 0; i < count; i++) {
    const node = nodes[i]
    const nodeId = node.id

    // key index
    if (node.key !== null) {
      const lower = node.key.toLowerCase()
      keyText[nodeId] = lower
      const existing = keyMap.get(lower)
      if (existing) {
        existing.push(nodeId)
      } else {
        keyMap.set(lower, [nodeId])
      }
    } else {
      keyText[nodeId] = null
    }

    // value index
    if (node.value !== null) {
      const lower = node.value.toLowerCase()
      valueText[nodeId] = lower
      const existing = valueMap.get(lower)
      if (existing) {
        existing.push(nodeId)
      } else {
        valueMap.set(lower, [nodeId])
      }
    } else {
      valueText[nodeId] = null
    }

    labelText[nodeId] = node.label.toLowerCase()

    // parent map (precompute parent → child relationship for fast path building)
    for (let c = node.childStart; c < node.childEnd; c++) {
      const childId = doc.childIds[c]
      parentMap[childId] = nodeId
    }

    // combined search text: "key label value"
    const parts: string[] = []
    if (keyText[nodeId] !== null) parts.push(keyText[nodeId])
    if (labelText[nodeId]) parts.push(labelText[nodeId])
    if (valueText[nodeId] !== null) parts.push(valueText[nodeId])
    searchText[nodeId] = parts.join(' ')
  }

  return { keyMap, valueMap, parentMap, searchText, keyText, valueText, labelText }
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
    const node = nodes[i]
    const nodeId = node.id
    const text = index.searchText[nodeId]
    if (text.indexOf(lower) === -1) continue

    // determine which field matched
    const keyOffset = index.keyText[nodeId]?.indexOf(lower) ?? -1
    if (keyOffset !== -1) {
      hits.push({ nodeId, field: 'key', offset: keyOffset, length: lower.length })
      continue
    }

    const valueOffset = index.valueText[nodeId]?.indexOf(lower) ?? -1
    if (valueOffset !== -1) {
      hits.push({ nodeId, field: 'value', offset: valueOffset, length: lower.length })
    } else {
      hits.push({ nodeId, field: 'label', offset: index.labelText[nodeId].indexOf(lower), length: lower.length })
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

  // Build path maps in one traversal to avoid recomputing ancestry for each node.
  const pathMap = new Map<string, number>()
  const nodePath = new Array<string>(nodes.length)
  nodePath[doc.rootId] = ''
  const stack: number[] = [doc.rootId]

  while (stack.length > 0) {
    const currentId = stack.pop()!
    const currentNode = nodes[currentId]
    const currentPath = nodePath[currentId] ?? ''
    for (let i = currentNode.childStart; i < currentNode.childEnd; i++) {
      const childId = doc.childIds[i]
      const childNode = nodes[childId]
      const segment = childNode.label
      const childPath = currentPath ? `${currentPath}.${segment}` : segment
      nodePath[childId] = childPath
      if (childPath) {
        pathMap.set(childPath, childId)
      }
      stack.push(childId)
    }
  }

  // Collect id → nodeId mapping from nodes that define an "id", "$id", or "@id"
  const idTargets = new Map<string, number>()
  for (const node of nodes) {
    if (node.key !== null && (node.key === 'id' || node.key === '$id' || node.key === '@id') && node.value !== null) {
      idTargets.set(node.value, index.parentMap[node.id])
    }
  }

  for (const node of nodes) {
    if (node.key === null || node.value === null) continue
    const keyLower = node.key.toLowerCase()
    const nodeId = node.id

    if (!REF_KEYS.has(keyLower)) continue

    const value = node.value

    // JSON Pointer ref: "#/definitions/Foo" → resolve path
    if (value.startsWith(PATH_PREFIX)) {
      const refPath = value.slice(PATH_PREFIX.length).replaceAll('/', '.')
      const targetId = pathMap.get(refPath)
      if (targetId !== undefined && targetId !== nodeId) {
        edges.push({ sourceId: index.parentMap[nodeId], targetId, kind: 'ref' })
      }
      continue
    }

    // ID-based ref: "$ref": "SomeId" → match against collected ids
    if (keyLower === '$ref' || keyLower === '$type' || keyLower === 'type') {
      const target = idTargets.get(value)
      if (target !== undefined && target !== index.parentMap[nodeId]) {
        edges.push({ sourceId: index.parentMap[nodeId], targetId: target, kind: 'id' })
      }
    }
  }

  return edges
}
