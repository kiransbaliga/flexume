import type { Bullet, Entry, ResumeData, ResumeSettings, Section } from '../types'
import { uid } from '../lib/utils'

export const defaultSettings = (): ResumeSettings => ({
  fontFamily: 'serif',
  fontScale: 1,
  lineSpacing: 1.3,
  accentColor: '#1f2937',
  marginV: 16,
  marginH: 18,
  sectionGap: 13,
  entryGap: 9,
})

/**
 * Make a value loaded from storage / an imported file safe to render: fills in
 * any missing settings (forward-compatible with older saved files) and
 * guarantees the core arrays exist.
 */
export function normalizeResume(data: Partial<ResumeData> | null | undefined): ResumeData {
  const base = blankResume()
  if (!data || typeof data !== 'object') return base
  return {
    header: {
      name: data.header?.name ?? '',
      title: data.header?.title ?? '',
      contacts: Array.isArray(data.header?.contacts)
        ? data.header!.contacts.map((c) => ({
            id: c.id ?? uid('c'),
            value: c.value ?? '',
            link: c.link ?? '',
            enabled: c.enabled !== false,
          }))
        : base.header.contacts,
    },
    sections: Array.isArray(data.sections) ? data.sections : base.sections,
    settings: { ...defaultSettings(), ...(data.settings ?? {}) },
  }
}

const bullet = (text: string): Bullet => ({ id: uid('b'), text, enabled: true })

const entry = (e: Partial<Entry>): Entry => ({
  id: uid('e'),
  enabled: true,
  nested: false,
  title: '',
  subtitle: '',
  meta: '',
  description: '',
  bullets: [],
  ...e,
})

export const newBullet = bullet
export const newEntry = () => entry({})

export const newSection = (): Section => ({
  id: uid('s'),
  title: 'New Section',
  enabled: true,
  kind: 'standard',
  entries: [newEntry()],
})

/** Empty-but-structured resume: the four classic sections, no content. */
export function blankResume(): ResumeData {
  return {
    header: {
      name: '',
      title: '',
      contacts: [
        { id: uid('c'), value: '', link: '', enabled: true },
        { id: uid('c'), value: '', link: '', enabled: true },
        { id: uid('c'), value: '', link: '', enabled: true },
      ],
    },
    sections: [
      { id: uid('s'), title: 'Summary', enabled: true, kind: 'summary', entries: [newEntry()] },
      { id: uid('s'), title: 'Experience', enabled: true, kind: 'standard', entries: [newEntry()] },
      { id: uid('s'), title: 'Education', enabled: true, kind: 'standard', entries: [newEntry()] },
      { id: uid('s'), title: 'Skills', enabled: true, kind: 'skills', entries: [newEntry()] },
    ],
    settings: defaultSettings(),
  }
}

/** Fully filled example so the preview shows the format on first load. */
export function sampleResume(): ResumeData {
  return {
    header: {
      name: 'Alex Morgan',
      title: 'Senior Software Engineer',
      contacts: [
        { id: uid('c'), value: 'alex.morgan@email.com', link: '', enabled: true },
        { id: uid('c'), value: '(555) 123-4567', link: '', enabled: true },
        { id: uid('c'), value: 'San Francisco, CA', link: '', enabled: true },
        { id: uid('c'), value: 'linkedin.com/in/alexmorgan', link: '', enabled: true },
        { id: uid('c'), value: 'github.com/alexmorgan', link: '', enabled: true },
      ],
    },
    sections: [
      {
        id: uid('s'),
        title: 'Summary',
        enabled: true,
        kind: 'summary',
        entries: [
          entry({
            description:
              'Senior software engineer with 7+ years building reliable, high-scale web platforms. Specialised in distributed systems, developer tooling, and leading small teams from design to delivery.',
          }),
        ],
      },
      {
        id: uid('s'),
        title: 'Experience',
        enabled: true,
        kind: 'standard',
        entries: [
          entry({
            title: 'Senior Software Engineer',
            subtitle: 'Northwind Technologies — San Francisco, CA',
            meta: '2021 — Present',
            bullets: [
              bullet('Led the redesign of the billing platform serving 2M+ users, cutting payment failures by 28%.'),
              bullet('Mentored 4 engineers and introduced a code-review rubric that reduced regression bugs by 35%.'),
              bullet('Designed an event-driven ingestion pipeline processing 500M events/day on AWS and Kafka.'),
            ],
          }),
          entry({
            title: 'Software Engineer',
            subtitle: 'Quantar Labs — Remote',
            meta: '2018 — 2021',
            bullets: [
              bullet('Built a React component library adopted across 6 product teams, halving UI delivery time.'),
              bullet('Migrated a monolith to containerised services, improving deploy frequency from weekly to daily.'),
            ],
          }),
        ],
      },
      {
        id: uid('s'),
        title: 'Education',
        enabled: true,
        kind: 'standard',
        entries: [
          entry({
            title: 'B.S. in Computer Science',
            subtitle: 'University of California, Berkeley',
            meta: '2014 — 2018',
            bullets: [bullet('Graduated with honors · GPA 3.8/4.0 · Teaching assistant for Data Structures.')],
          }),
        ],
      },
      {
        id: uid('s'),
        title: 'Skills',
        enabled: true,
        kind: 'skills',
        entries: [
          entry({ title: 'Languages', description: 'TypeScript, Python, Go, SQL, Java' }),
          entry({ title: 'Frameworks', description: 'React, Node.js, FastAPI, Next.js' }),
          entry({ title: 'Infrastructure', description: 'AWS, Docker, Kubernetes, Kafka, PostgreSQL' }),
        ],
      },
    ],
    settings: defaultSettings(),
  }
}
