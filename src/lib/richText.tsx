import type { ReactNode } from 'react'

// Lightweight inline formatting markers used across editable text fields:
//   **bold**   *italic*   __underline__   ==highlight==
// Stored as plain text (so JSON export / AI editing keep working) and parsed
// into elements only when rendering the résumé.

export const FORMAT_MARKS = {
  bold: '**',
  italic: '*',
  underline: '__',
  highlight: '==',
} as const

// Order matters: multi-char openers (** __ ==) are tried before single *.
const TOKEN_RE = /(\*\*|__|==|\*)([\s\S]+?)\1/

/** Parse marker syntax into React nodes (recurses for nesting). */
export function renderRich(text: string, keyPrefix = 'r'): ReactNode {
  if (!text) return text
  const nodes: ReactNode[] = []
  let rest = text
  let i = 0

  while (rest.length) {
    const m = TOKEN_RE.exec(rest)
    if (!m) {
      nodes.push(rest)
      break
    }
    if (m.index > 0) nodes.push(rest.slice(0, m.index))

    const [full, marker, inner] = m
    const key = `${keyPrefix}-${i++}`
    const child = renderRich(inner, key)

    if (marker === '**') nodes.push(<strong key={key}>{child}</strong>)
    else if (marker === '__') nodes.push(<u key={key}>{child}</u>)
    else if (marker === '==') nodes.push(<mark key={key}>{child}</mark>)
    else nodes.push(<em key={key}>{child}</em>)

    rest = rest.slice(m.index + full.length)
  }

  return nodes
}
