import { useLayoutEffect, useRef } from 'react'
import type {
  ButtonHTMLAttributes,
  ReactNode,
  TextareaHTMLAttributes,
} from 'react'
import { cx } from '../lib/utils'

// ── Icons ────────────────────────────────────────────────────────────────────
type IconName =
  | 'chevron'
  | 'eye'
  | 'eyeOff'
  | 'trash'
  | 'plus'
  | 'minus'
  | 'up'
  | 'down'
  | 'sparkles'
  | 'spinner'
  | 'link'
  | 'nest'

const PATHS: Record<IconName, ReactNode> = {
  chevron: <polyline points="6 9 12 15 18 9" />,
  eye: (
    <>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  eyeOff: (
    <>
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c6.5 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
      <path d="M6.61 6.61A13.5 13.5 0 0 0 2 12s3.5 7 10 7a9.12 9.12 0 0 0 5.39-1.61" />
      <line x1="2" y1="2" x2="22" y2="22" />
    </>
  ),
  trash: (
    <>
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </>
  ),
  plus: (
    <>
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </>
  ),
  minus: <line x1="5" y1="12" x2="19" y2="12" />,
  up: <polyline points="18 15 12 9 6 15" />,
  down: <polyline points="6 9 12 15 18 9" />,
  sparkles: (
    <path d="M12 3l1.9 4.8L18.7 9.7l-4.8 1.9L12 16.4l-1.9-4.8L5.3 9.7l4.8-1.9L12 3Z" />
  ),
  spinner: <path d="M21 12a9 9 0 1 1-6.2-8.6" />,
  link: (
    <>
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </>
  ),
  nest: (
    <>
      <path d="M5 4v7a4 4 0 0 0 4 4h10" />
      <polyline points="15 11 19 15 15 19" />
    </>
  ),
}

export function Icon({
  name,
  size = 16,
  className,
}: {
  name: IconName
  size?: number
  className?: string
}) {
  return (
    <svg
      className={cx('icon', name === 'spinner' && 'icon-spin', className)}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {PATHS[name]}
    </svg>
  )
}

// ── Icon button ────────────────────────────────────────────────────────────--
interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: IconName
  label: string
  size?: number
}

export function IconButton({ icon, label, size, className, ...rest }: IconButtonProps) {
  return (
    <button type="button" className={cx('icon-btn', className)} title={label} aria-label={label} {...rest}>
      <Icon name={icon} size={size} />
    </button>
  )
}

// ── Include / exclude toggle (the "add to PDF" switch) ───────────────────────-
export function IncludeToggle({
  on,
  onChange,
  label,
}: {
  on: boolean
  onChange: () => void
  label: string
}) {
  return (
    <button
      type="button"
      className={cx('include-toggle', on ? 'on' : 'off')}
      onClick={onChange}
      title={on ? `${label}: shown in PDF` : `${label}: hidden from PDF`}
      aria-pressed={on}
    >
      <Icon name={on ? 'eye' : 'eyeOff'} size={15} />
    </button>
  )
}

// ── Expand / collapse toggle (circular +/− like the reference UI) ────────────
export function ExpandToggle({ open, onClick }: { open: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      className="expand-btn"
      onClick={onClick}
      title={open ? 'Collapse' : 'Expand'}
      aria-expanded={open}
    >
      <Icon name={open ? 'minus' : 'plus'} size={16} />
    </button>
  )
}

// ── Auto-growing textarea ────────────────────────────────────────────────────
export function AutoTextarea({
  value,
  className,
  ...rest
}: TextareaHTMLAttributes<HTMLTextAreaElement> & { value: string }) {
  const ref = useRef<HTMLTextAreaElement>(null)
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight}px`
  }, [value])
  return <textarea ref={ref} rows={1} value={value} className={cx('auto-textarea', className)} {...rest} />
}
