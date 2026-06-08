// Turn a contact's value/link into a real href. If the user supplied an
// explicit `link` we honour it (only adding a scheme when missing); otherwise
// we infer the scheme from the display value.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_RE = /^[+()\-.\s\d]{7,}$/
const HAS_SCHEME_RE = /^[a-z][a-z0-9+.-]*:/i

/** Returns a usable href, or null when the value shouldn't be a link. */
export function resolveContactHref(value: string, link: string): string | null {
  const explicit = link.trim()
  const raw = (explicit || value).trim()
  if (!raw) return null

  // Already has a scheme (https:, mailto:, tel:, etc.) — use as-is.
  if (HAS_SCHEME_RE.test(raw)) return raw

  if (EMAIL_RE.test(raw)) return `mailto:${raw}`
  if (PHONE_RE.test(raw) && /\d/.test(raw)) return `tel:${raw.replace(/[^\d+]/g, '')}`

  // Looks like a domain / URL (e.g. linkedin.com/in/x, github.com/x, site.dev).
  if (/^[\w-]+(\.[\w-]+)+(\/\S*)?$/.test(raw)) return `https://${raw}`

  // Plain text (a city, etc.) — only linkable if the user typed an explicit link.
  return explicit ? `https://${explicit}` : null
}
