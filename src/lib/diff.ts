import type { FlatNode, ParsedDocument } from './types'

export type DiffKind = 'added' | 'removed' | 'changed' | 'unchanged'

export interface DiffEntry {
  path: string
  kind: DiffKind
  nodeIdA?: number
  nodeIdB?: number
  oldValue?: string | null
  newValue?: string | null
}

export function diffDocuments(docA: ParsedDocument, docB: ParsedDocument): DiffEntry[] {
  const entries: DiffEntry[] = []
  diffNode(docA, docB, docA.rootId, docB.rootId, '', entries)
  return entries
}

function diffNode(
  docA: ParsedDocument,
  docB: ParsedDocument,
  idA: number,
  idB: number,
  path: string,
  entries: DiffEntry[],
): void {
  const nodeA = docA.nodes[idA]
  const nodeB = docB.nodes[idB]

  // Compare values for leaf nodes
  if (nodeA.kind === 'value' && nodeB.kind === 'value') {
    if (nodeA.value !== nodeB.value) {
      entries.push({ path, kind: 'changed', nodeIdA: idA, nodeIdB: idB, oldValue: nodeA.value, newValue: nodeB.value })
    } else {
      entries.push({ path, kind: 'unchanged', nodeIdA: idA, nodeIdB: idB })
    }
    return
  }

  // Kind changed (e.g. object → value)
  if (nodeA.kind !== nodeB.kind) {
    entries.push({ path, kind: 'changed', nodeIdA: idA, nodeIdB: idB, oldValue: `[${nodeA.kind}]`, newValue: `[${nodeB.kind}]` })
    return
  }

  // Both are containers — compare children by key
  const childrenA = getChildMap(docA, nodeA)
  const childrenB = getChildMap(docB, nodeB)

  const allKeys = new Set([...childrenA.keys(), ...childrenB.keys()])

  for (const key of allKeys) {
    const childPath = path ? `${path}.${key}` : key
    const aId = childrenA.get(key)
    const bId = childrenB.get(key)

    if (aId !== undefined && bId !== undefined) {
      diffNode(docA, docB, aId, bId, childPath, entries)
    } else if (aId !== undefined) {
      collectAll(docA, aId, childPath, 'removed', entries)
    } else if (bId !== undefined) {
      collectAll(docB, bId!, childPath, 'added', entries)
    }
  }
}

function getChildMap(doc: ParsedDocument, node: FlatNode): Map<string, number> {
  const map = new Map<string, number>()
  for (let i = node.childStart; i < node.childEnd; i++) {
    const childId = doc.childIds[i]
    const child = doc.nodes[childId]
    const key = child.key ?? child.label ?? String(i - node.childStart)
    map.set(key, childId)
  }
  return map
}

function collectAll(
  doc: ParsedDocument,
  nodeId: number,
  path: string,
  kind: 'added' | 'removed',
  entries: DiffEntry[],
): void {
  const node = doc.nodes[nodeId]
  const idField = kind === 'added' ? 'nodeIdB' : 'nodeIdA'
  entries.push({
    path,
    kind,
    [idField]: nodeId,
    ...(kind === 'added' ? { newValue: node.value } : { oldValue: node.value }),
  })

  for (let i = node.childStart; i < node.childEnd; i++) {
    const childId = doc.childIds[i]
    const child = doc.nodes[childId]
    const childPath = `${path}.${child.key ?? child.label ?? String(i - node.childStart)}`
    collectAll(doc, childId, childPath, kind, entries)
  }
}
