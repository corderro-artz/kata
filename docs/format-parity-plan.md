# Format parity plan

Closing the gap between what Kata can read and what Kata can write.

> **Status: implemented.** All five phases shipped. `npm run check` now runs
> `scripts/format-parity.mjs`, which fails the build if a format can be written
> but not read, or if an exporter loses data without saying so. The section
> below is kept as the record of what was wrong and why each fix took the shape
> it did.
>
> **One correction to the original plan.** Steps 5 and 13 proposed using the
> browser's `DOMParser` for XML and XAML "via `self.DOMParser`, at zero bundle
> cost". That is wrong: `DOMParser` is a DOM API and is **not** exposed in a
> Web Worker. Both parsers use `fast-xml-parser` instead, dynamically imported
> inside the worker. It lands in its own lazy chunk, so the initial bundle is
> unaffected (24.71 KB gzip against the 50 KB budget).

## 1. Current state

`SourceFormat` (`src/lib/types.ts:1`) declares **6** inputs. `ExportFormat`
(`src/lib/types.ts:5`) declares **7** outputs. They are not the same set, and
even where the names match the conversion is not reversible.

| Format | Import | Export | Round-trip (export → re-import) |
|---|---|---|---|
| JSON | yes | yes | lossless |
| YAML | yes | yes | lossless (verified) |
| TOML | yes | yes | **lossy** — `null` keys silently vanish |
| INI | yes | yes | **lossy** — numbers and arrays come back as strings |
| Markdown | outline only | yes | **not reversible** |
| Text | 24-line sample only | yes | **destructive** |
| XAML | **none** | yes | one-way; arrays of objects collapse |
| XML | none | none | absent |
| CSV / TSV | none | none | absent |
| JSONC / JSON5 | undeclared (tolerant fallback only) | none | absent |

Everything below was confirmed against the actual serializers, not inferred.

## 2. Gaps

### G1 — XAML is write-only (the headline gap)

`toXaml` (`src/workers/export.worker.ts:139`) emits a XAML `ResourceDictionary`,
but `inferFormat` (`src/lib/formats.ts:7`) has no `xaml` branch. A `.xaml` file
dropped on Kata falls through to `text`, so the app cannot read back a file it
just wrote.

XAML export is also lossy on its own terms: `appendXamlNode` hard-codes arrays
as `Type="x:String"` and stringifies every element
(`src/workers/export.worker.ts:157`), so `[{a:1},{a:2}]` serializes as two
`[object Object]` strings. That data is gone before any parser could recover it.

### G2 — TOML drops nulls with no diagnostic

```
stringify({ a: null, b: 1 })  →  parse(…)  →  { b: 1 }
```

`smol-toml` does not throw on `null`; it omits the key. `prepareValue`
(`src/workers/export.worker.ts:54`) only rewrites a null *root*, so nested nulls
reach the serializer and disappear. The export reports success.

### G3 — INI loses scalar types

```
{ n: 42, arr: [1,2,3], deep:{a:{b:1}} }
  → ini.stringify → ini.parse →
{ n: "42", arr: ["1","2","3"], deep:{a:{b:"1"}} }
```

INI has no type system. Numbers survive as strings, array elements as strings.
Booleans and `null` happen to survive. Nothing warns the user.

### G4 — Text export is unreadable back

`toText` (`src/workers/export.worker.ts:186`) writes real dotted-path lines
(`a.b[0] = 1`). The import side, `buildTextFallback`
(`src/workers/parse.worker.ts:218`), ignores that format entirely and returns
`{ format, lineCount, sample: lines.slice(0, 24) }`. Re-importing a text export
of a 10,000-line document yields 24 strings. This is the worst asymmetry in the
codebase: a well-formed, machine-readable output that Kata itself throws away.

### G5 — Markdown import is an outline, not a model

`buildMarkdownOutline` (`src/workers/parse.worker.ts:170`) produces
`{ title, format, lineCount, sections[] }` where each body is an opaque string.
Tables, lists, front matter and code fences are never structured. Meanwhile
`toMarkdown` (`src/workers/export.worker.ts:86`) writes headings and
`- key: value` bullets. The two do not meet: exporting JSON to Markdown and
reading it back gives you a document *about* the headings, not the data.

### G6 — `asTomlRoot` injects a phantom key

`asTomlRoot` (`src/workers/export.worker.ts:78`) wraps a non-object root as
`{ value: … }` for TOML and INI. Re-import returns `{ value: … }`, one level
deeper than the original, and nothing strips it.

### G7 — Format knowledge is duplicated in five places

| Location | What it lists |
|---|---|
| `src/lib/formats.ts:7` `inferFormat` | extension → format |
| `src/lib/formats.ts:79` `isSupportedTextFile` | workspace scan filter |
| `src/lib/fs.ts:15` `showOpenFilePicker` types | native picker filter |
| `src/app.tsx:908` `accept` attribute | fallback `<input type=file>` |
| `src/app.tsx:670` export `<select>` | output menu |

These five lists already disagree — none mention `xaml`. Any new format has to
be added in all five, so they will keep drifting. This is the root cause of G1,
not a side effect of it.

### G8 — Missing formats users expect

No XML (the XAML writer is a narrow `ResourceDictionary` flavor, not general
XML), no CSV/TSV, and no declared JSONC/JSON5 — even though `parseJson`
(`src/workers/parse.worker.ts:161`) already strips comments and trailing commas
on the fallback path. The capability exists but no extension routes to it.

### G9 — `isSupportedTextFile` filters out the new formats in advance

```ts
return format !== 'text' || /\.(txt|log|text)$/i.test(name)
```

Anything `inferFormat` does not recognise is excluded from workspace scanning.
`.xaml`, `.xml`, `.csv`, `.jsonc` are invisible in a directory today, and will
stay invisible until `inferFormat` learns them — so G7 must be fixed before any
new parser can be reached through the workspace picker.

## 3. Design: one format registry

Replace the five lists with one table, `src/lib/registry.ts`:

```ts
export interface FormatSpec {
  id: FormatId
  label: string
  extensions: string[]
  mimes: string[]
  exportExtension: string
  exportMime: string
  canParse: boolean
  canSerialize: boolean
  fidelity: 'lossless' | 'lossy' | 'one-way'
  lossNotes?: string
}
```

Everything else derives from it:

- `inferFormat` — built from `extensions` / `mimes`
- `isSupportedTextFile` — `canParse`
- `fs.ts` picker types and the `app.tsx` `accept` string — generated
- export `<select>` options — `specs.filter(s => s.canSerialize)`
- a **fidelity badge** next to the export selector, driven by `fidelity` and
  `lossNotes`

The parse and serialize functions stay in their workers (the registry must not
pull parsers into the initial bundle). The registry holds metadata only and
declares which worker branch handles each id; the workers keep their existing
`await import()` dispatch so the bundle budget is unaffected.

Once the registry exists, adding a format is one entry plus two worker branches,
and parity becomes checkable rather than hopeful.

## 4. Work phases

### Phase 0 — Registry (prerequisite)

1. Add `src/lib/registry.ts` with the six current formats plus `xaml`.
2. Rewrite `inferFormat`, `isSupportedTextFile`, `exportMime`,
   `suggestExportName`, `recommendedExportFormat` as registry lookups.
3. Generate the `accept` string and picker types from the registry; delete the
   hard-coded lists in `fs.ts:15` and `app.tsx:908`.
4. Generate the export `<select>` options from `canSerialize`.

No behaviour change except `.xaml` becoming visible. Ships on its own.

### Phase 1 — Close the one-way gaps

5. **XAML import.** New `parseXaml` branch in the parse worker: read a
   `ResourceDictionary`, map `x:String`/`x:Array`/nested dictionaries back to
   objects, arrays and scalars. Use the browser's built-in `DOMParser` — it is
   available in workers via `self.DOMParser`, costs zero bundle bytes, and is
   enough for this dialect. Register `.xaml` → `xaml`.
6. **XAML export fidelity.** Recurse into array elements in `appendXamlNode`
   instead of `stringifyScalar`, and emit typed leaves (`x:Int32`, `x:Boolean`,
   `x:Double`, `x:Null`) so scalar types survive. Drop the fixed
   `Type="x:String"` on heterogeneous arrays.
7. **Text import.** Detect Kata's own dotted-path output in
   `buildTextFallback` (`a.b[0] = 1` lines) and rebuild the object graph.
   Fall back to the line sample only when the shape does not match. Keep the
   24-line sample for genuinely unstructured text, but record the truncation in
   `diagnostics` — silently dropping the tail is the current bug.

After this phase every `ExportFormat` has a parser: the literal
input/output imbalance is gone.

### Phase 2 — Fidelity and honesty

8. **TOML nulls.** In `prepareValue`, walk nested values and either omit nulls
   deliberately with a diagnostic, or encode them as a sentinel. Either way,
   push a `diagnostics` entry naming the dropped keys. Never report a silent
   success.
9. **INI types.** Push a diagnostic listing coerced keys on export, and on
   import attempt numeric/boolean coercion for values that round-trip exactly
   (`String(Number(v)) === v`). Mark INI `fidelity: 'lossy'` in the registry.
10. **Phantom root key.** Record the wrap in the export (a `x-kata-root-scalar`
    comment for TOML/INI) and unwrap it on import.
11. **Markdown.** Parse front matter (YAML block between `---` fences) into real
    structured data, and parse GFM tables into arrays of objects. Keep the
    outline for prose. This makes the common Markdown-as-data cases reversible
    without pretending arbitrary prose is a data model.

### Phase 3 — New formats

12. **CSV / TSV** — both directions. Hand-roll an RFC 4180 reader/writer
    (~80 lines, quoted fields, embedded newlines) rather than adding a
    dependency. Import → array of row objects; export → only when the root is
    an array of flat objects, otherwise disable the option in the selector.
13. **XML** — both directions, general-purpose, distinct from `xaml`. Import via
    `DOMParser` (same zero-cost route as step 5); export via a generalised
    `toXaml`. Attribute handling needs a convention — `@attr` keys, matching
    `fast-xml-parser`'s default, so the mapping is familiar.
14. **JSONC / JSON5** — register `.jsonc`, `.json5` against the tolerant path
    that `parseJson` already implements. Import-only; keep JSON as the output.
    Nearly free, since the parser exists.

### Phase 4 — Keep parity from regressing

15. Add `scripts/format-parity.mjs`, run in CI alongside `npm run check`:
    - every `canSerialize` format also has `canParse` (or is explicitly marked
      `one-way` in the registry with a reason)
    - for each lossless format, a fixture round-trips to a deep-equal value
    - for each lossy format, the loss matches a recorded snapshot, so new loss
      fails the build
16. Extend the fixture set to cover nulls, nested arrays of objects, unicode
    keys, empty containers and scalar roots — the cases that break today.

The repo has no test framework by design (`CLAUDE.md`); this is a plain Node
script asserting round-trips, consistent with how `perf:report` already works.

## 5. Constraints to respect

- **Initial bundle < 50 KB gzip.** Every new parser must stay behind
  `await import()` *inside a worker*, as YAML/TOML/INI/micromark already are.
  Preferring `DOMParser` for XML and XAML and a hand-rolled CSV keeps Phase 2–3
  at roughly zero added bundle weight.
- **No main-thread parsing.** `parse-inline.ts` stays JSON-only
  (`app.tsx:354` pins `formatHint: 'json'`). Do not extend the fast path to the
  new formats.
- **Flat model only.** New parsers return plain `structuredData`;
  `buildFlatModel` handles flattening. Do not add recursive traversal.

## 6. Sequencing

Phase 0 is a hard prerequisite — G9 means new parsers are unreachable through
the workspace picker until the registry lands. Phase 1 is the smallest change
that answers the original complaint. Phases 2–4 are independently shippable and
can be reordered against demand.

| Phase | Outcome | Depends on |
|---|---|---|
| 0 | One source of truth; five lists deleted | — |
| 1 | Every output format is also an input | 0 |
| 2 | Losses are fixed or disclosed, never silent | 0 |
| 3 | CSV/TSV, XML, JSONC added both ways | 0 |
| 4 | CI fails on any new asymmetry | 0–3 |

## 7. Out of scope

Round-tripping arbitrary prose Markdown or unstructured text back into a data
model. Those stay `fidelity: 'lossy'` with the loss disclosed in the UI rather
than papered over.
