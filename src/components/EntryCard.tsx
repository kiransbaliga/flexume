import { useState } from 'react'
import type { Entry, SectionKind } from '../types'
import { useResume } from '../store'
import { cx } from '../lib/utils'
import { Icon, IconButton, IncludeToggle } from './ui'
import { RichTextarea } from './RichTextarea'
import { AiMenu } from './AiMenu'
import { BulletRow } from './BulletRow'

interface Props {
  sid: string
  kind: SectionKind
  entry: Entry
  index: number
  count: number
}

export function EntryCard({ sid, kind, entry, index, count }: Props) {
  const { actions } = useResume()
  const [collapsed, setCollapsed] = useState(false)

  const summary =
    entry.title ||
    entry.subtitle ||
    (entry.description ? entry.description.slice(0, 48) : '') ||
    `Item ${index + 1}`

  const showHeadFields = kind === 'standard'
  const showCategory = kind === 'skills'
  const showDescription = kind === 'summary' || kind === 'skills'
  const showBullets = kind === 'standard'

  return (
    <div className={cx('entry-card', !entry.enabled && 'disabled', entry.nested && 'nested')}>
      <div className="entry-head">
        <button
          type="button"
          className={cx('chev', collapsed && 'collapsed')}
          onClick={() => setCollapsed((v) => !v)}
          title={collapsed ? 'Expand' : 'Collapse'}
        >
          <Icon name="chevron" size={15} />
        </button>
        <span className="entry-summary" onClick={() => setCollapsed((v) => !v)}>
          {summary}
        </span>
        <div className="row-tools">
          {kind === 'standard' && (
            <IconButton
              icon="nest"
              label={entry.nested ? 'Un-nest (make top-level)' : 'Nest under item above'}
              className={cx('hover-tool', entry.nested && 'active')}
              disabled={index === 0 && !entry.nested}
              onClick={() => actions.toggleEntryNested(sid, entry.id)}
            />
          )}
          <IncludeToggle
            on={entry.enabled}
            label="Item"
            onChange={() => actions.toggleEntry(sid, entry.id)}
          />
          <IconButton icon="up" label="Move up" disabled={index === 0} onClick={() => actions.moveEntry(sid, entry.id, -1)} />
          <IconButton
            icon="down"
            label="Move down"
            disabled={index === count - 1}
            onClick={() => actions.moveEntry(sid, entry.id, 1)}
          />
          <IconButton icon="trash" label="Delete item" className="danger" onClick={() => actions.removeEntry(sid, entry.id)} />
        </div>
      </div>

      {!collapsed && (
        <div className="entry-body">
          {showHeadFields && (
            <>
              <div className="field-grid">
                <label className="field">
                  <span>Title</span>
                  <input
                    type="text"
                    value={entry.title}
                    placeholder="Job title / degree / project"
                    onChange={(e) => actions.updateEntry(sid, entry.id, { title: e.target.value })}
                  />
                </label>
                <label className="field meta">
                  <span>Date / location</span>
                  <input
                    type="text"
                    value={entry.meta}
                    placeholder="2021 — Present"
                    onChange={(e) => actions.updateEntry(sid, entry.id, { meta: e.target.value })}
                  />
                </label>
              </div>
              <label className="field">
                <span>Subtitle</span>
                <input
                  type="text"
                  value={entry.subtitle}
                  placeholder="Company / school — location"
                  onChange={(e) => actions.updateEntry(sid, entry.id, { subtitle: e.target.value })}
                />
              </label>
            </>
          )}

          {showCategory && (
            <label className="field">
              <span>Category</span>
              <input
                type="text"
                value={entry.title}
                placeholder="Languages / Frameworks / Tools"
                onChange={(e) => actions.updateEntry(sid, entry.id, { title: e.target.value })}
              />
            </label>
          )}

          {showDescription && (
            <label className="field">
              <span className="field-label-row">
                {kind === 'skills' ? 'Items (comma-separated)' : 'Text'}
                <AiMenu
                  getText={() => entry.description}
                  onResult={(t) => actions.updateEntry(sid, entry.id, { description: t })}
                />
              </span>
              <RichTextarea
                value={entry.description}
                placeholder={kind === 'skills' ? 'TypeScript, Python, Go, SQL' : 'Write a short professional summary…'}
                onChange={(t) => actions.updateEntry(sid, entry.id, { description: t })}
              />
            </label>
          )}

          {showBullets && (
            <div className="bullets">
              {entry.bullets.map((b, i) => (
                <BulletRow key={b.id} sid={sid} eid={entry.id} bullet={b} index={i} count={entry.bullets.length} />
              ))}
              <button type="button" className="add-inline" onClick={() => actions.addBullet(sid, entry.id)}>
                <Icon name="plus" size={13} /> Add bullet
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
