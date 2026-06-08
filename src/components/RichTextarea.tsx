import { useLayoutEffect, useRef, useState } from 'react'
import { FORMAT_MARKS } from '../lib/richText'
import { cx } from '../lib/utils'

interface Props {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  className?: string
}

type Mark = keyof typeof FORMAT_MARKS

const BUTTONS: { mark: Mark; label: string; title: string; className: string }[] = [
  { mark: 'bold', label: 'B', title: 'Bold  (**text**)', className: 'fmt-b' },
  { mark: 'italic', label: 'I', title: 'Italic  (*text*)', className: 'fmt-i' },
  { mark: 'underline', label: 'U', title: 'Underline  (__text__)', className: 'fmt-u' },
  { mark: 'highlight', label: 'H', title: 'Highlight  (==text==)', className: 'fmt-h' },
]

export function RichTextarea({ value, onChange, placeholder, className }: Props) {
  const ref = useRef<HTMLTextAreaElement>(null)
  const [focused, setFocused] = useState(false)

  // Auto-grow to fit content.
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight}px`
  }, [value])

  function applyMark(mark: Mark) {
    const el = ref.current
    if (!el) return
    const token = FORMAT_MARKS[mark]
    const start = el.selectionStart
    const end = el.selectionEnd
    const selected = value.slice(start, end)
    const before = value.slice(0, start)
    const after = value.slice(end)

    let next: string
    let caretStart: number
    let caretEnd: number
    if (selected) {
      next = `${before}${token}${selected}${token}${after}`
      caretStart = start + token.length
      caretEnd = end + token.length
    } else {
      // No selection: insert empty markers and place the caret between them.
      next = `${before}${token}${token}${after}`
      caretStart = caretEnd = start + token.length
    }

    onChange(next)
    requestAnimationFrame(() => {
      el.focus()
      el.setSelectionRange(caretStart, caretEnd)
    })
  }

  return (
    <div className={cx('rich-field', focused && 'focused')}>
      <textarea
        ref={ref}
        className={cx('auto-textarea', className)}
        rows={1}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
      <div className="format-bar" role="toolbar" aria-label="Text formatting">
        {BUTTONS.map((b) => (
          <button
            key={b.mark}
            type="button"
            className={cx('fmt-btn', b.className)}
            title={b.title}
            // Prevent the textarea from blurring so the selection survives.
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => applyMark(b.mark)}
          >
            {b.label}
          </button>
        ))}
      </div>
    </div>
  )
}
