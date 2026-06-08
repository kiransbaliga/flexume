import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react'
import type { Entry, ResumeData, Section } from '../types'
import { renderRich } from '../lib/richText'
import { resolveContactHref } from '../lib/links'

const FONT_STACKS: Record<ResumeData['settings']['fontFamily'], string> = {
  serif: "Georgia, 'Times New Roman', 'Liberation Serif', serif",
  sans: "'Helvetica Neue', Helvetica, Arial, 'Liberation Sans', sans-serif",
}

// CSS treats 1mm as 96/25.4 px, so an A4 page is a fixed pixel height regardless
// of the on-screen zoom (transform: scale doesn't change layout/offset height).
const MM_TO_PX = 96 / 25.4
const A4_PAGE_PX = 297 * MM_TO_PX

/**
 * Renders the resume exactly as it will print. The element with class
 * `resume-page` is what the print stylesheet isolates onto the PDF page, so the
 * on-screen preview and the exported PDF are identical. Dashed overlay lines
 * mark each A4 page boundary; they are hidden when printing.
 */
export function ResumeDoc({
  resume,
  onPagesChange,
}: {
  resume: ResumeData
  onPagesChange?: (pages: number) => void
}) {
  const { header, sections, settings } = resume
  const contacts = header.contacts.filter((c) => c.enabled && c.value.trim())
  const visibleSections = sections.filter((s) => s.enabled && hasContent(s))

  const pageRef = useRef<HTMLDivElement>(null)
  const [pageHeight, setPageHeight] = useState(0)

  // Track the rendered height so we know how many A4 pages the content spans.
  useLayoutEffect(() => {
    const el = pageRef.current
    if (!el) return
    const measure = () => setPageHeight(el.offsetHeight)
    measure()
    if (typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const pageCount = Math.max(1, Math.ceil((pageHeight - 2) / A4_PAGE_PX))
  useEffect(() => {
    onPagesChange?.(pageCount)
  }, [pageCount, onPagesChange])

  const breaks: number[] = []
  for (let i = 1; i < pageCount; i++) breaks.push(i * A4_PAGE_PX)

  const pageStyle = {
    '--accent': settings.accentColor,
    '--doc-font': FONT_STACKS[settings.fontFamily],
    '--doc-scale': settings.fontScale,
    '--doc-lh': settings.lineSpacing,
    '--doc-mv': `${settings.marginV}mm`,
    '--doc-mh': `${settings.marginH}mm`,
    '--doc-section-gap': `${settings.sectionGap}px`,
    '--doc-entry-gap': `${settings.entryGap}px`,
  } as CSSProperties

  return (
    <div className="resume-page" style={pageStyle} ref={pageRef}>
      <header className="r-header">
        {header.name.trim() && <h1 className="r-name">{header.name}</h1>}
        {header.title.trim() && <div className="r-tagline">{header.title}</div>}
        {contacts.length > 0 && (
          <div className="r-contacts">
            {contacts.map((c, i) => {
              const href = resolveContactHref(c.value, c.link)
              return (
                <span key={c.id}>
                  {i > 0 && <span className="r-sep">·</span>}
                  {href ? (
                    <a className="r-link" href={href} target="_blank" rel="noreferrer">
                      {c.value}
                    </a>
                  ) : (
                    c.value
                  )}
                </span>
              )
            })}
          </div>
        )}
      </header>

      {visibleSections.map((s) => (
        <section className="r-section" key={s.id}>
          <h2 className="r-section-title">{s.title}</h2>
          <SectionBody section={s} />
        </section>
      ))}

      {breaks.length > 0 && (
        <div className="page-breaks" aria-hidden="true">
          {breaks.map((y, i) => (
            <div className="page-break-line" style={{ top: `${y}px` }} key={i}>
              <span className="page-break-label">Page {i + 2}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function SectionBody({ section }: { section: Section }) {
  const entries = section.entries.filter((e) => e.enabled && entryHasContent(e, section.kind))

  if (section.kind === 'summary') {
    return (
      <>
        {entries.map((e) => (
          <p className="r-summary" key={e.id}>
            {renderRich(e.description)}
          </p>
        ))}
      </>
    )
  }

  if (section.kind === 'skills') {
    return (
      <div className="r-skills">
        {entries.map((e) => {
          const items = e.bullets.filter((b) => b.enabled && b.text.trim()).map((b) => b.text)
          const text = e.description.trim() || items.join(', ')
          return (
            <div className="r-skill-line" key={e.id}>
              {e.title.trim() && <span className="r-skill-cat">{renderRich(e.title)}: </span>}
              <span>{renderRich(text)}</span>
            </div>
          )
        })}
      </div>
    )
  }

  // standard: title + meta row, subtitle, bullets
  return (
    <>
      {entries.map((e) => {
        const bullets = e.bullets.filter((b) => b.enabled && b.text.trim())
        return (
          <div className={e.nested ? 'r-entry nested' : 'r-entry'} key={e.id}>
            {(e.title.trim() || e.meta.trim()) && (
              <div className="r-entry-head">
                <span className="r-entry-title">{renderRich(e.title)}</span>
                {e.meta.trim() && <span className="r-entry-meta">{renderRich(e.meta)}</span>}
              </div>
            )}
            {e.subtitle.trim() && <div className="r-entry-sub">{renderRich(e.subtitle)}</div>}
            {bullets.length > 0 && (
              <ul className="r-bullets">
                {bullets.map((b) => (
                  <li key={b.id}>{renderRich(b.text)}</li>
                ))}
              </ul>
            )}
          </div>
        )
      })}
    </>
  )
}

function entryHasContent(e: Entry, kind: Section['kind']): boolean {
  if (kind === 'summary') return !!e.description.trim()
  if (kind === 'skills')
    return !!e.title.trim() || !!e.description.trim() || e.bullets.some((b) => b.enabled && b.text.trim())
  return (
    !!e.title.trim() ||
    !!e.subtitle.trim() ||
    !!e.meta.trim() ||
    e.bullets.some((b) => b.enabled && b.text.trim())
  )
}

function hasContent(s: Section): boolean {
  return s.entries.some((e) => e.enabled && entryHasContent(e, s.kind))
}
