import { useCallback, useEffect, useRef, useState } from 'react'
import { ResumeProvider, useResume } from './store'
import { Toolbar } from './components/Toolbar'
import { EditorPane } from './components/EditorPane'
import { PreviewPane } from './components/PreviewPane'

const WIDTH_KEY = 'resume-builder:editorWidth'
const MIN_EDITOR_W = 340

function Workspace() {
  const { resume } = useResume()
  const [editorWidth, setEditorWidth] = useState<number>(() => {
    const saved = Number(localStorage.getItem(WIDTH_KEY))
    return saved >= MIN_EDITOR_W ? saved : 460
  })

  useEffect(() => {
    localStorage.setItem(WIDTH_KEY, String(editorWidth))
  }, [editorWidth])

  // Drag-to-resize the editor pane. The pane's left edge is at viewport x=0,
  // so the pointer's clientX is the target width.
  const startDrag = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    const onMove = (ev: MouseEvent) => {
      const max = Math.min(860, window.innerWidth - 380)
      setEditorWidth(Math.max(MIN_EDITOR_W, Math.min(max, ev.clientX)))
    }
    const onUp = () => {
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
      document.body.classList.remove('resizing')
    }
    document.body.classList.add('resizing')
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
  }, [])

  // Name the print/PDF file after the candidate.
  const nameRef = useRef(resume.header.name)
  nameRef.current = resume.header.name
  function exportPdf() {
    const prev = document.title
    const name = nameRef.current.trim().replace(/\s+/g, '_') || 'resume'
    document.title = `${name}_resume`
    const restore = () => {
      document.title = prev
      window.removeEventListener('afterprint', restore)
    }
    window.addEventListener('afterprint', restore)
    window.print()
  }

  // Cmd/Ctrl+P → our export (keeps the nice filename behaviour).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'p') {
        e.preventDefault()
        exportPdf()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <div className="app-shell">
      <Toolbar onExport={exportPdf} />
      <main className="panes">
        <EditorPane width={editorWidth} />
        <div className="splitter" onMouseDown={startDrag} title="Drag to resize" role="separator" aria-orientation="vertical">
          <span className="splitter-grip" />
        </div>
        <PreviewPane />
      </main>
    </div>
  )
}

export default function App() {
  return (
    <ResumeProvider>
      <Workspace />
    </ResumeProvider>
  )
}
