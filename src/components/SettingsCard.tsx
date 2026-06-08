import { useState } from 'react'
import { useResume } from '../store'
import type { ResumeSettings } from '../types'
import { ExpandToggle } from './ui'

function Slider({
  label,
  value,
  min,
  max,
  step,
  suffix,
  display,
  onChange,
}: {
  label: string
  value: number
  min: number
  max: number
  step: number
  suffix?: string
  display?: (v: number) => string
  onChange: (v: number) => void
}) {
  return (
    <label className="set-slider">
      <span className="set-slider-head">
        {label}
        <b>{display ? display(value) : `${value}${suffix ?? ''}`}</b>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </label>
  )
}

export function SettingsCard() {
  const { resume, actions } = useResume()
  const s = resume.settings
  const [open, setOpen] = useState(false)
  const set = (patch: Partial<ResumeSettings>) => actions.updateSettings(patch)

  return (
    <div className="section-card settings-card">
      <div className="section-head">
        <span className="section-title-input static">Page &amp; Layout</span>
        <span className="settings-summary">
          {s.fontFamily === 'serif' ? 'Serif' : 'Sans'} · {s.marginH}/{s.marginV}mm
        </span>
        <ExpandToggle open={open} onClick={() => setOpen((v) => !v)} />
      </div>

      {open && (
        <div className="section-body settings-body">
          <div className="set-row">
            <label className="set-inline">
              Font
              <select value={s.fontFamily} onChange={(e) => set({ fontFamily: e.target.value as 'serif' | 'sans' })}>
                <option value="serif">Serif</option>
                <option value="sans">Sans</option>
              </select>
            </label>
            <label className="set-inline">
              Accent
              <input type="color" value={s.accentColor} onChange={(e) => set({ accentColor: e.target.value })} />
            </label>
          </div>

          <div className="set-grid">
            <Slider
              label="Text size"
              value={s.fontScale}
              min={0.85}
              max={1.15}
              step={0.01}
              display={(v) => `${Math.round(v * 100)}%`}
              onChange={(v) => set({ fontScale: v })}
            />
            <Slider
              label="Line spacing"
              value={s.lineSpacing}
              min={1.15}
              max={1.5}
              step={0.01}
              display={(v) => v.toFixed(2)}
              onChange={(v) => set({ lineSpacing: v })}
            />
            <Slider
              label="Margin · top/bottom"
              value={s.marginV}
              min={6}
              max={30}
              step={1}
              suffix="mm"
              onChange={(v) => set({ marginV: v })}
            />
            <Slider
              label="Margin · left/right"
              value={s.marginH}
              min={6}
              max={30}
              step={1}
              suffix="mm"
              onChange={(v) => set({ marginH: v })}
            />
            <Slider
              label="Section spacing"
              value={s.sectionGap}
              min={4}
              max={32}
              step={1}
              suffix="px"
              onChange={(v) => set({ sectionGap: v })}
            />
            <Slider
              label="Entry spacing"
              value={s.entryGap}
              min={2}
              max={26}
              step={1}
              suffix="px"
              onChange={(v) => set({ entryGap: v })}
            />
          </div>
        </div>
      )}
    </div>
  )
}
