import { useEffect, useRef, useState } from 'react'
import { useResume } from '../store'
import { checkOllama, OLLAMA_MODEL, type OllamaStatus } from '../lib/ollama'
import type { ResumeData } from '../types'
import { cx } from '../lib/utils'
import { Icon } from './ui'

export function Toolbar({ onExport }: { onExport: () => void }) {
  const { resume, actions } = useResume()
  const [status, setStatus] = useState<OllamaStatus | null>(null)
  const [saveState, setSaveState] = useState<'saving' | 'saved'>('saved')
  const fileRef = useRef<HTMLInputElement>(null)
  const firstRender = useRef(true)

  // Ollama heartbeat.
  useEffect(() => {
    let alive = true
    const ping = () => checkOllama().then((s) => alive && setStatus(s))
    ping()
    const t = setInterval(ping, 15000)
    return () => {
      alive = false
      clearInterval(t)
    }
  }, [])

  // Autosave indicator (the actual save happens in the store).
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false
      return
    }
    setSaveState('saving')
    const t = setTimeout(() => setSaveState('saved'), 500)
    return () => clearTimeout(t)
  }, [resume])

  const ollamaClass = !status ? 'pending' : status.ok && status.hasModel ? 'ok' : status.ok ? 'warn' : 'bad'
  const ollamaText = !status
    ? 'Checking Ollama…'
    : status.ok && status.hasModel
      ? `Ollama · ${OLLAMA_MODEL}`
      : status.ok
        ? `${OLLAMA_MODEL} missing`
        : 'Ollama offline'

  const fileName = (resume.header.name.trim().replace(/\s+/g, '_') || 'resume') + '_resume'

  function exportJson() {
    const blob = new Blob([JSON.stringify(resume, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${fileName}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  async function importJson(file: File) {
    try {
      const text = await file.text()
      const data = JSON.parse(text) as ResumeData
      if (!data || typeof data !== 'object' || !Array.isArray(data.sections)) {
        throw new Error('not a resume file')
      }
      actions.replaceAll(data)
    } catch {
      alert('Could not import that file — it is not a valid resume JSON export.')
    }
  }

  return (
    <header className="topbar">
      <div className="topbar-left">
        <div className="brand">
          <span className="brand-mark">
            <Icon name="sparkles" size={15} />
          </span>
          <span className="brand-name">Flexume</span>
        </div>
        <span className="crumb">
          <span className="crumb-dim">Home</span>
          <span className="crumb-sep">/</span>
          Create resume
        </span>
      </div>

      <div className="topbar-center">
        <span className={cx('savestate', saveState)}>
          <span className="save-dot" />
          {saveState === 'saving' ? 'Saving your resume…' : 'All changes saved'}
        </span>
      </div>

      <div className="topbar-right">
        <div className={cx('ollama-status', ollamaClass)} title={status?.error ?? ollamaText}>
          <span className="dot" />
          {ollamaText}
        </div>

        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          hidden
          onChange={(e) => {
            const f = e.target.files?.[0]
            if (f) importJson(f)
            e.target.value = ''
          }}
        />
        <button type="button" className="btn ghost" onClick={actions.loadSample}>
          Sample
        </button>
        <button
          type="button"
          className="btn ghost"
          onClick={() => {
            if (confirm('Clear all content and start from a blank template?')) actions.clearAll()
          }}
        >
          Clear
        </button>
        <button type="button" className="btn outline" onClick={() => fileRef.current?.click()} title="Load a saved .json resume">
          Import
        </button>
        <button type="button" className="btn outline" onClick={exportJson} title="Download resume data as .json to continue later">
          Save JSON
        </button>
        <button type="button" className="btn primary" onClick={onExport}>
          Download PDF
        </button>
      </div>
    </header>
  )
}
