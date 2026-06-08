import { useState } from 'react'
import type { Section, SectionKind } from '../types'
import { useResume } from '../store'
import { cx } from '../lib/utils'
import { ExpandToggle, Icon, IconButton, IncludeToggle } from './ui'
import { EntryCard } from './EntryCard'

const KIND_LABELS: Record<SectionKind, string> = {
  summary: 'Paragraph',
  standard: 'Entries + bullets',
  skills: 'Categories',
}

interface Props {
  section: Section
  index: number
  count: number
}

export function SectionCard({ section, index, count }: Props) {
  const { actions } = useResume()
  const [open, setOpen] = useState(true)

  return (
    <div className={cx('section-card', !section.enabled && 'disabled')}>
      <div className="section-head">
        <input
          className="section-title-input"
          value={section.title}
          placeholder="Section title"
          onChange={(e) => actions.updateSection(section.id, { title: e.target.value })}
        />
        <div className="row-tools">
          <IconButton icon="up" label="Move up" className="hover-tool" disabled={index === 0} onClick={() => actions.moveSection(section.id, -1)} />
          <IconButton
            icon="down"
            label="Move down"
            className="hover-tool"
            disabled={index === count - 1}
            onClick={() => actions.moveSection(section.id, 1)}
          />
          <IconButton icon="trash" label="Delete section" className="hover-tool danger" onClick={() => actions.removeSection(section.id)} />
          <IncludeToggle on={section.enabled} label="Section" onChange={() => actions.toggleSection(section.id)} />
        </div>
        <ExpandToggle open={open} onClick={() => setOpen((v) => !v)} />
      </div>

      {open && (
        <div className="section-body">
          <label className="set-inline kind-row">
            Display as
            <select
              className="kind-select"
              value={section.kind}
              onChange={(e) => actions.updateSection(section.id, { kind: e.target.value as SectionKind })}
            >
              {(Object.keys(KIND_LABELS) as SectionKind[]).map((k) => (
                <option key={k} value={k}>
                  {KIND_LABELS[k]}
                </option>
              ))}
            </select>
          </label>

          {section.entries.map((e, i) => (
            <EntryCard key={e.id} sid={section.id} kind={section.kind} entry={e} index={i} count={section.entries.length} />
          ))}
          <button type="button" className="add-entry" onClick={() => actions.addEntry(section.id)}>
            <Icon name="plus" size={14} /> Add {section.kind === 'skills' ? 'category' : 'item'}
          </button>
        </div>
      )}
    </div>
  )
}
