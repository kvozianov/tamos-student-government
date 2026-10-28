/** Минимальный конструктор документа Lexical для начального наполнения. */
type Node = { type: string; version: number; [k: string]: unknown }

const text = (value: string, format = 0): Node => ({ type: 'text', version: 1, text: value, format, style: '', mode: 'normal', detail: 0 })

export const p = (value: string): Node => ({
  type: 'paragraph',
  version: 1,
  direction: 'ltr',
  format: '',
  indent: 0,
  textFormat: 0,
  textStyle: '',
  children: [text(value)],
})

export const h = (value: string, tag: 'h2' | 'h3' = 'h2'): Node => ({
  type: 'heading',
  tag,
  version: 1,
  direction: 'ltr',
  format: '',
  indent: 0,
  children: [text(value)],
})

export const ul = (items: string[]): Node => ({
  type: 'list',
  listType: 'bullet',
  tag: 'ul',
  start: 1,
  version: 1,
  direction: 'ltr',
  format: '',
  indent: 0,
  children: items.map((value, i) => ({ type: 'listitem', value: i + 1, version: 1, direction: 'ltr', format: '', indent: 0, children: [text(value)] })),
})

export const doc = (...children: Node[]) => ({
  root: { type: 'root', version: 1, direction: 'ltr' as const, format: '' as const, indent: 0, children },
})
