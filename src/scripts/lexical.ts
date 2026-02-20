/**
 * Minimal Lexical editor state for seed data (root + paragraph + text).
 */
export function lexicalParagraph(text: string): {
  root: {
    type: string
    children: Array<Record<string, unknown>>
    direction: null
    format: ''
    indent: number
    version: number
  }
} {
  return {
    root: {
      type: 'root',
      direction: null,
      format: '',
      indent: 0,
      version: 1,
      children: [
        {
          type: 'paragraph',
          version: 1,
          children: [{ type: 'text', version: 1, text }],
        },
      ],
    },
  }
}
