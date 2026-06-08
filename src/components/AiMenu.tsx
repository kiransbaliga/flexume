import { useEffect, useRef, useState } from 'react'
import { AI_PRESETS, transformText } from '../lib/ollama'
import { cx } from '../lib/utils'
import { Icon } from './ui'

interface Props {
  /** Current text of the field this menu edits. */
  getText: () => string
  /** Called with the AI-rewritten text. */
  onResult: (text: string) => void
  /** Compact variant for inline (bullet) use. */
  compact?: boolean
}

export function AiMenu({ getText, onResult, compact }: Props) {
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [custom, setCustom] = useState('')
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [open])

  async function run(instruction: string, busyKey: string) {
    const text = getText().trim()
    if (!text) {
      setError('Field is empty — nothing to rewrite.')
      return
    }
    setBusy(busyKey)
    setError(null)
    try {
      const out = await transformText(text, instruction)
      if (out) {
        onResult(out)
        setOpen(false)
        setCustom('')
      } else {
        setError('Model returned nothing. Try again.')
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Request failed. Is Ollama running?')
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="ai-menu" ref={rootRef}>
      <button
        type="button"
        className={cx('ai-trigger', compact && 'compact', open && 'active')}
        onClick={() => setOpen((v) => !v)}
        title="Edit with AI (Ollama)"
      >
        <Icon name={busy ? 'spinner' : 'sparkles'} size={compact ? 13 : 14} />
        {!compact && <span>AI</span>}
      </button>

      {open && (
        <div className="ai-pop" role="menu">
          <div className="ai-pop-head">Rewrite with gemma4</div>
          <div className="ai-presets">
            {AI_PRESETS.map((p) => (
              <button
                key={p.id}
                type="button"
                className="ai-preset"
                disabled={!!busy}
                onClick={() => run(p.instruction, p.id)}
                title={p.hint}
              >
                {busy === p.id ? <Icon name="spinner" size={13} /> : null}
                {p.label}
              </button>
            ))}
          </div>
          <div className="ai-custom">
            <input
              type="text"
              value={custom}
              placeholder="Custom instruction…"
              onChange={(e) => setCustom(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && custom.trim() && !busy) run(custom.trim(), 'custom')
              }}
              disabled={!!busy}
            />
            <button
              type="button"
              className="ai-run"
              disabled={!!busy || !custom.trim()}
              onClick={() => run(custom.trim(), 'custom')}
            >
              {busy === 'custom' ? <Icon name="spinner" size={13} /> : 'Run'}
            </button>
          </div>
          {error && <div className="ai-error">{error}</div>}
        </div>
      )}
    </div>
  )
}
