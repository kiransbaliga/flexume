// ─────────────────────────────────────────────────────────────────────────────
// Generic resume data model.
//
// The whole resume is a tree:  Resume → Section[] → Entry[] → Bullet[]
// Every node carries an `enabled` flag so any piece can be toggled in/out of the
// rendered document without deleting it ("visual build-up"). This generic shape
// is what makes the app template-able: a template is just how a `Section.kind`
// is rendered, nothing is hard-coded to "Experience" or "Skills".
// ─────────────────────────────────────────────────────────────────────────────

export interface Bullet {
  id: string
  text: string
  enabled: boolean
}

export interface Entry {
  id: string
  enabled: boolean
  nested: boolean // render indented as a sub-item of the entry above (e.g. a project under a company)
  title: string // e.g. job title, degree, project name, or a skill category
  subtitle: string // e.g. company, school, tech stack
  meta: string // e.g. date range or location (right-aligned in the render)
  description: string // free paragraph (used by summary / skills kinds)
  bullets: Bullet[]
}

/**
 * How a section renders. The editor is identical for all kinds; only the
 * preview differs. Add a new kind here + a branch in <ResumeDoc> to extend.
 */
export type SectionKind = 'summary' | 'standard' | 'skills'

export interface Section {
  id: string
  title: string
  enabled: boolean
  kind: SectionKind
  entries: Entry[]
}

export interface ContactItem {
  id: string
  value: string // display text
  link: string // explicit href target; if blank it is auto-detected from value
  enabled: boolean
}

export interface ResumeHeader {
  name: string
  title: string // tagline under the name, e.g. "Senior Software Engineer"
  contacts: ContactItem[]
}

export interface ResumeSettings {
  fontFamily: 'serif' | 'sans'
  fontScale: number // 0.85 – 1.15
  lineSpacing: number // 1.15 – 1.5
  accentColor: string // section headings + tagline
  marginV: number // mm, top & bottom page margin
  marginH: number // mm, left & right page margin
  sectionGap: number // px, vertical space above each section
  entryGap: number // px, vertical space below each entry
}

export interface ResumeData {
  header: ResumeHeader
  sections: Section[]
  settings: ResumeSettings
}
