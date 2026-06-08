import { useResume } from '../store'
import { Icon } from './ui'
import { HeaderEditor } from './HeaderEditor'
import { SectionCard } from './SectionCard'
import { SettingsCard } from './SettingsCard'

export function EditorPane({ width }: { width: number }) {
  const { resume, actions } = useResume()
  return (
    <div className="editor-pane" style={{ width }}>
      <div className="editor-scroll">
        <SettingsCard />
        <HeaderEditor />
        {resume.sections.map((s, i) => (
          <SectionCard key={s.id} section={s} index={i} count={resume.sections.length} />
        ))}
        <button type="button" className="add-section" onClick={actions.addSection}>
          <Icon name="plus" size={16} /> Add section
        </button>
        <p className="editor-hint">
          Toggle the <Icon name="eye" size={12} /> on any item to include or hide it from the PDF.
        </p>
      </div>
    </div>
  )
}
