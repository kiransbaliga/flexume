import { useState } from 'react'
import { useResume } from '../store'
import { cx } from '../lib/utils'
import { resolveContactHref } from '../lib/links'
import { ExpandToggle, Icon, IconButton, IncludeToggle } from './ui'

export function HeaderEditor() {
  const { resume, actions } = useResume()
  const { header } = resume
  const [open, setOpen] = useState(true)

  return (
    <div className="section-card header-card">
      <div className="section-head">
        <span className="section-title-input static">Personal information</span>
        <ExpandToggle open={open} onClick={() => setOpen((v) => !v)} />
      </div>

      {open && (
        <div className="section-body">
          <div className="field-grid">
            <label className="field">
              <span>Full name</span>
              <input
                type="text"
                value={header.name}
                placeholder="Alex Morgan"
                onChange={(e) => actions.setHeaderField('name', e.target.value)}
              />
            </label>
            <label className="field">
              <span>Tagline</span>
              <input
                type="text"
                value={header.title}
                placeholder="Senior Software Engineer"
                onChange={(e) => actions.setHeaderField('title', e.target.value)}
              />
            </label>
          </div>

          <div className="contacts">
            <span className="field-sublabel">Contact details</span>
            {header.contacts.map((c, i) => {
              const href = resolveContactHref(c.value, c.link)
              return (
                <div key={c.id} className={cx('contact-item', !c.enabled && 'disabled')}>
                  <div className="contact-row">
                    <input
                      type="text"
                      value={c.value}
                      placeholder="Email · phone · city · profile…"
                      onChange={(e) => actions.updateContact(c.id, e.target.value)}
                    />
                    <div className="row-tools">
                      <IncludeToggle on={c.enabled} label="Contact" onChange={() => actions.toggleContact(c.id)} />
                      <IconButton icon="up" label="Move up" disabled={i === 0} onClick={() => actions.moveContact(c.id, -1)} />
                      <IconButton
                        icon="down"
                        label="Move down"
                        disabled={i === header.contacts.length - 1}
                        onClick={() => actions.moveContact(c.id, 1)}
                      />
                      <IconButton icon="trash" label="Delete" className="danger" onClick={() => actions.removeContact(c.id)} />
                    </div>
                  </div>
                  <div className="contact-link" title={href ? `Links to ${href}` : undefined}>
                    <Icon name="link" size={13} className={href ? 'link-on' : 'link-off'} />
                    <input
                      type="text"
                      value={c.link}
                      placeholder={href ? `Auto-links to ${href}` : 'Add link — URL, email, or phone (optional)'}
                      onChange={(e) => actions.updateContactLink(c.id, e.target.value)}
                    />
                  </div>
                </div>
              )
            })}
            <button type="button" className="add-inline" onClick={actions.addContact}>
              <Icon name="plus" size={13} /> Add contact
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
