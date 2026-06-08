import { createContext, useContext, useEffect, useMemo } from 'react'
import { useImmer } from 'use-immer'
import type { Entry, ResumeData, ResumeSettings, Section, SectionKind } from './types'
import { moveById, uid } from './lib/utils'
import { blankResume, newBullet, newEntry, newSection, normalizeResume, sampleResume } from './data/resume'

const STORAGE_KEY = 'resume-builder:v1'

export interface Actions {
  // header
  setHeaderField: (field: 'name' | 'title', value: string) => void
  addContact: () => void
  updateContact: (id: string, value: string) => void
  updateContactLink: (id: string, link: string) => void
  toggleContact: (id: string) => void
  removeContact: (id: string) => void
  moveContact: (id: string, dir: -1 | 1) => void
  // sections
  addSection: () => void
  updateSection: (sid: string, patch: Partial<Pick<Section, 'title' | 'kind'>>) => void
  toggleSection: (sid: string) => void
  removeSection: (sid: string) => void
  moveSection: (sid: string, dir: -1 | 1) => void
  // entries
  addEntry: (sid: string) => void
  updateEntry: (sid: string, eid: string, patch: Partial<Pick<Entry, 'title' | 'subtitle' | 'meta' | 'description'>>) => void
  toggleEntry: (sid: string, eid: string) => void
  toggleEntryNested: (sid: string, eid: string) => void
  removeEntry: (sid: string, eid: string) => void
  moveEntry: (sid: string, eid: string, dir: -1 | 1) => void
  // bullets
  addBullet: (sid: string, eid: string) => void
  updateBullet: (sid: string, eid: string, bid: string, text: string) => void
  toggleBullet: (sid: string, eid: string, bid: string) => void
  removeBullet: (sid: string, eid: string, bid: string) => void
  moveBullet: (sid: string, eid: string, bid: string, dir: -1 | 1) => void
  // document
  updateSettings: (patch: Partial<ResumeSettings>) => void
  loadSample: () => void
  clearAll: () => void
  replaceAll: (data: ResumeData) => void
}

interface StoreValue {
  resume: ResumeData
  actions: Actions
}

const ResumeContext = createContext<StoreValue | null>(null)

function loadInitial(): ResumeData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return normalizeResume(JSON.parse(raw) as ResumeData)
  } catch {
    /* ignore corrupt storage */
  }
  return sampleResume()
}

export function ResumeProvider({ children }: { children: React.ReactNode }) {
  const [resume, update] = useImmer<ResumeData>(loadInitial)

  // Autosave.
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(resume))
    } catch {
      /* storage full / unavailable — non-fatal */
    }
  }, [resume])

  const actions = useMemo<Actions>(() => {
    const section = (d: ResumeData, sid: string) => d.sections.find((s) => s.id === sid)
    const entryOf = (d: ResumeData, sid: string, eid: string) =>
      section(d, sid)?.entries.find((e) => e.id === eid)

    return {
      setHeaderField: (field, value) =>
        update((d) => {
          d.header[field] = value
        }),
      addContact: () =>
        update((d) => {
          d.header.contacts.push({ id: uid('c'), value: '', link: '', enabled: true })
        }),
      updateContact: (id, value) =>
        update((d) => {
          const c = d.header.contacts.find((x) => x.id === id)
          if (c) c.value = value
        }),
      updateContactLink: (id, link) =>
        update((d) => {
          const c = d.header.contacts.find((x) => x.id === id)
          if (c) c.link = link
        }),
      toggleContact: (id) =>
        update((d) => {
          const c = d.header.contacts.find((x) => x.id === id)
          if (c) c.enabled = !c.enabled
        }),
      removeContact: (id) =>
        update((d) => {
          d.header.contacts = d.header.contacts.filter((x) => x.id !== id)
        }),
      moveContact: (id, dir) =>
        update((d) => {
          moveById(d.header.contacts, id, dir)
        }),

      addSection: () =>
        update((d) => {
          d.sections.push(newSection())
        }),
      updateSection: (sid, patch) =>
        update((d) => {
          const s = section(d, sid)
          if (s) Object.assign(s, patch)
        }),
      toggleSection: (sid) =>
        update((d) => {
          const s = section(d, sid)
          if (s) s.enabled = !s.enabled
        }),
      removeSection: (sid) =>
        update((d) => {
          d.sections = d.sections.filter((s) => s.id !== sid)
        }),
      moveSection: (sid, dir) =>
        update((d) => {
          moveById(d.sections, sid, dir)
        }),

      addEntry: (sid) =>
        update((d) => {
          section(d, sid)?.entries.push(newEntry())
        }),
      updateEntry: (sid, eid, patch) =>
        update((d) => {
          const e = entryOf(d, sid, eid)
          if (e) Object.assign(e, patch)
        }),
      toggleEntry: (sid, eid) =>
        update((d) => {
          const e = entryOf(d, sid, eid)
          if (e) e.enabled = !e.enabled
        }),
      toggleEntryNested: (sid, eid) =>
        update((d) => {
          const e = entryOf(d, sid, eid)
          if (e) e.nested = !e.nested
        }),
      removeEntry: (sid, eid) =>
        update((d) => {
          const s = section(d, sid)
          if (s) s.entries = s.entries.filter((e) => e.id !== eid)
        }),
      moveEntry: (sid, eid, dir) =>
        update((d) => {
          const s = section(d, sid)
          if (s) moveById(s.entries, eid, dir)
        }),

      addBullet: (sid, eid) =>
        update((d) => {
          entryOf(d, sid, eid)?.bullets.push(newBullet(''))
        }),
      updateBullet: (sid, eid, bid, text) =>
        update((d) => {
          const b = entryOf(d, sid, eid)?.bullets.find((x) => x.id === bid)
          if (b) b.text = text
        }),
      toggleBullet: (sid, eid, bid) =>
        update((d) => {
          const b = entryOf(d, sid, eid)?.bullets.find((x) => x.id === bid)
          if (b) b.enabled = !b.enabled
        }),
      removeBullet: (sid, eid, bid) =>
        update((d) => {
          const e = entryOf(d, sid, eid)
          if (e) e.bullets = e.bullets.filter((x) => x.id !== bid)
        }),
      moveBullet: (sid, eid, bid, dir) =>
        update((d) => {
          const e = entryOf(d, sid, eid)
          if (e) moveById(e.bullets, bid, dir)
        }),

      updateSettings: (patch) =>
        update((d) => {
          Object.assign(d.settings, patch)
        }),
      loadSample: () => update(() => sampleResume()),
      clearAll: () => update(() => blankResume()),
      replaceAll: (data) => update(() => normalizeResume(data)),
    }
  }, [update])

  const value = useMemo(() => ({ resume, actions }), [resume, actions])
  return <ResumeContext.Provider value={value}>{children}</ResumeContext.Provider>
}

export function useResume(): StoreValue {
  const ctx = useContext(ResumeContext)
  if (!ctx) throw new Error('useResume must be used inside <ResumeProvider>')
  return ctx
}

export type { SectionKind }
