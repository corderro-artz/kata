#!/usr/bin/env node
/**
 * Guards the input/output balance of the conversion system.
 *
 * Kata has no test framework by design, so this is a plain Node script wired
 * into CI next to `npm run check`. It asserts three things:
 *
 *   1. Registry integrity — one entry per format, no duplicate extensions.
 *   2. Parity — every format Kata can write, Kata can also read. A format may
 *      opt out only by declaring `fidelity: 'one-way'` with a reason.
 *   3. Round-trip honesty — `lossless` formats must come back deep-equal, and
 *      a `lossy` format must *say* what it lost. Silent loss fails the build.
 *
 * `src/lib/convert.ts` is bundled with esbuild first so that Node resolves the
 * extensionless TypeScript imports the same way Vite does.
 */
import { mkdir, mkdtemp, rm } from 'node:fs/promises'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { inspect } from 'node:util'

import { build } from 'esbuild'

const EXTERNAL = ['yaml', 'smol-toml', 'ini', 'micromark', 'fast-xml-parser']

// The bundle must sit inside the project so Node resolves the externalised
// parsers out of the local node_modules.
const SCRATCH_ROOT = 'node_modules/.cache'

/** Exercises nulls, empty containers, type-ambiguous strings and unicode. */
const RICH = {
  string: 'hello',
  numericString: '42',
  booleanString: 'true',
  emptyString: '',
  padded: '  padded  ',
  number: 42,
  float: 1.5,
  negative: -7,
  zero: 0,
  boolTrue: true,
  boolFalse: false,
  nullValue: null,
  emptyObject: {},
  emptyArray: [],
  mixedArray: [1, 'two', false, null],
  singleItemArray: ['only'],
  nested: { deep: { deeper: { value: 'bottom' } } },
  records: [{ id: 1, name: 'alpha' }, { id: 2, name: 'beta' }],
  unicode: 'caffè — 日本語 — ✓',
  'weird key': 'not a valid xml name',
  'needs<escaping>&': '<tag> & "quoted"',
}

/** A flat table, which is the only shape CSV and TSV can carry losslessly. */
const TABLE = [
  { id: 1, name: 'alpha', active: true, score: 1.5 },
  { id: 2, name: 'beta, with comma', active: false, score: -3 },
  { id: 3, name: 'gamma "quoted"', active: true, score: 0 },
]

const failures = []
const warnings = []
const results = []

function fail(message) {
  failures.push(message)
}

function show(value) {
  return inspect(value, { depth: 8, breakLength: 100 })
}

function firstDifference(left, right, path = '') {
  if (Object.is(left, right)) return null

  if (Array.isArray(left) || Array.isArray(right)) {
    if (!Array.isArray(left) || !Array.isArray(right)) return path || '(root)'
    if (left.length !== right.length) return `${path || '(root)'} (length ${left.length} vs ${right.length})`
    for (let index = 0; index < left.length; index += 1) {
      const diff = firstDifference(left[index], right[index], `${path}[${index}]`)
      if (diff) return diff
    }
    return null
  }

  if (left && right && typeof left === 'object' && typeof right === 'object') {
    const keys = new Set([...Object.keys(left), ...Object.keys(right)])
    for (const key of keys) {
      if (!(key in left)) return `${path}.${key} (missing on the way back)`
      if (!(key in right)) return `${path}.${key} (added on the way back)`
      const diff = firstDifference(left[key], right[key], `${path}.${key}`)
      if (diff) return diff
    }
    return null
  }

  return `${path || '(root)'} (${show(left)} → ${show(right)})`
}

async function loadConvert() {
  await mkdir(SCRATCH_ROOT, { recursive: true })
  const directory = await mkdtemp(join(SCRATCH_ROOT, 'kata-parity-'))
  const outfile = join(directory, 'convert.mjs')

  await build({
    entryPoints: ['src/lib/convert.ts'],
    bundle: true,
    format: 'esm',
    platform: 'node',
    target: 'node20',
    external: EXTERNAL,
    outfile,
    logLevel: 'silent',
  })

  const module = await import(pathToFileURL(outfile).href)
  return { module, cleanup: () => rm(directory, { recursive: true, force: true }) }
}

async function loadRegistry() {
  await mkdir(SCRATCH_ROOT, { recursive: true })
  const directory = await mkdtemp(join(SCRATCH_ROOT, 'kata-registry-'))
  const outfile = join(directory, 'registry.mjs')

  await build({
    entryPoints: ['src/lib/registry.ts'],
    bundle: true,
    format: 'esm',
    platform: 'node',
    target: 'node20',
    outfile,
    logLevel: 'silent',
  })

  const module = await import(pathToFileURL(outfile).href)
  return { module, cleanup: () => rm(directory, { recursive: true, force: true }) }
}

function checkRegistry(FORMAT_SPECS) {
  const ids = new Set()
  const extensions = new Map()

  for (const spec of FORMAT_SPECS) {
    if (ids.has(spec.id)) {
      fail(`Registry: duplicate format id "${spec.id}".`)
    }
    ids.add(spec.id)

    if (!spec.canParse && !spec.canSerialize) {
      fail(`Registry: "${spec.id}" can neither parse nor serialize.`)
    }

    for (const extension of spec.extensions) {
      if (extensions.has(extension)) {
        fail(`Registry: extension ".${extension}" claimed by both "${extensions.get(extension)}" and "${spec.id}".`)
      }
      extensions.set(extension, spec.id)
    }

    if (spec.fidelity === 'lossy' && !spec.lossNotes) {
      fail(`Registry: "${spec.id}" is marked lossy but does not say what it loses.`)
    }
  }

  // The rule this whole script exists to enforce.
  for (const spec of FORMAT_SPECS) {
    if (spec.canSerialize && !spec.canParse) {
      if (spec.fidelity !== 'one-way' || !spec.oneWayReason) {
        fail(
          `Parity: "${spec.id}" can be exported but not imported. Add a parser, or declare `
          + "fidelity: 'one-way' with an oneWayReason.",
        )
      }
    }
  }
}

async function roundTrip(convert, spec, fixture, label) {
  const { serializeFormat, parseFormat } = convert

  let serialized
  try {
    serialized = await serializeFormat(fixture, spec.id, {
      sourceName: `fixture.${spec.exportExtension}`,
      sourceFormat: 'json',
      sourceText: JSON.stringify(fixture),
    })
  } catch (error) {
    fail(`${spec.id} [${label}]: export threw — ${error.message}`)
    return false
  }

  let reparsed
  try {
    reparsed = await parseFormat(serialized.text, spec.id, `fixture.${spec.exportExtension}`)
  } catch (error) {
    fail(`${spec.id} [${label}]: re-import threw — ${error.message}\n--- exported ---\n${serialized.text}`)
    return
  }

  const difference = firstDifference(fixture, reparsed.data)
  results.push({
    format: spec.id,
    label,
    outcome: difference ? `lossy at ${difference.split(' ')[0]}` : 'exact',
    notes: serialized.notes.length,
  })

  if (spec.fidelity === 'lossless') {
    if (difference) {
      fail(
        `${spec.id} [${label}]: declared lossless but changed at ${difference}\n`
        + `--- exported ---\n${serialized.text}\n--- re-imported ---\n${show(reparsed.data)}`,
      )
    }
    return !difference
  }

  // Lossy is allowed — being quiet about it is not.
  if (difference && serialized.notes.length === 0 && !spec.lossNotes) {
    fail(`${spec.id} [${label}]: lost data at ${difference} without any note explaining it.`)
    return false
  }

  return !difference
}

async function main() {
  const registry = await loadRegistry()
  const convert = await loadConvert()

  try {
    const { FORMAT_SPECS } = registry.module
    checkRegistry(FORMAT_SPECS)

    for (const spec of FORMAT_SPECS) {
      if (!spec.canSerialize) continue

      const tabular = spec.id === 'csv' || spec.id === 'tsv'
      const fixtures = tabular
        ? [['table', TABLE], ['rich', RICH]]
        // Scalar and empty roots are the cases that historically broke.
        : [['rich', RICH], ['scalar root', 'bare scalar'], ['array root', [1, 2, 3]]]

      const exact = []
      for (const [label, fixture] of fixtures) {
        exact.push(await roundTrip(convert.module, spec, fixture, label))
      }

      if (spec.fidelity !== 'lossless' && exact.every(Boolean)) {
        warnings.push(`${spec.id}: every fixture round-tripped exactly; consider promoting it to lossless.`)
      }
    }
  } finally {
    await convert.cleanup()
    await registry.cleanup()
  }

  const width = Math.max(...results.map((row) => row.format.length + row.label.length)) + 4
  for (const row of results) {
    const name = `${row.format} [${row.label}]`.padEnd(width)
    console.log(`  ${name}${row.outcome}${row.notes > 0 ? ` (${row.notes} note${row.notes === 1 ? '' : 's'})` : ''}`)
  }
  console.log('')

  for (const warning of warnings) {
    console.log(`note: ${warning}`)
  }

  if (failures.length > 0) {
    console.error(`\n${failures.length} format parity failure${failures.length === 1 ? '' : 's'}:\n`)
    for (const failure of failures) {
      console.error(`  ✗ ${failure}\n`)
    }
    process.exitCode = 1
    return
  }

  console.log('Format parity: all checks passed.')
}

await main()
