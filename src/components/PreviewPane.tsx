import { useState } from 'react'
import { useResume } from '../store'
import { ResumeDoc } from './ResumeDoc'

const ZOOMS = [0.5, 0.65, 0.8, 1, 1.15, 1.3]

export function PreviewPane() {
  const { resume } = useResume()
  const [zoom, setZoom] = useState(0.8)
  const [pages, setPages] = useState(1)

  const step = (dir: -1 | 1) => {
    const i = ZOOMS.indexOf(zoom)
    const next = ZOOMS[Math.min(ZOOMS.length - 1, Math.max(0, (i < 0 ? 3 : i) + dir))]
    setZoom(next)
  }

  return (
    <div className="preview-pane">
      <div className="preview-bar">
        <span className="preview-label">
          A4 · {pages} page{pages > 1 ? 's' : ''}
        </span>
        <div className="zoom">
          <button type="button" onClick={() => step(-1)} title="Zoom out" disabled={zoom === ZOOMS[0]}>
            −
          </button>
          <span className="zoom-val">{Math.round(zoom * 100)}%</span>
          <button
            type="button"
            onClick={() => step(1)}
            title="Zoom in"
            disabled={zoom === ZOOMS[ZOOMS.length - 1]}
          >
            +
          </button>
        </div>
      </div>
      <div className="preview-scroll">
        <div className="page-scaler" style={{ transform: `scale(${zoom})` }}>
          <ResumeDoc resume={resume} onPagesChange={setPages} />
        </div>
      </div>
    </div>
  )
}
