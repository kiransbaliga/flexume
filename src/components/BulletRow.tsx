import type { Bullet } from '../types'
import { useResume } from '../store'
import { cx } from '../lib/utils'
import { IconButton, IncludeToggle } from './ui'
import { RichTextarea } from './RichTextarea'
import { AiMenu } from './AiMenu'

interface Props {
  sid: string
  eid: string
  bullet: Bullet
  index: number
  count: number
}

export function BulletRow({ sid, eid, bullet, index, count }: Props) {
  const { actions } = useResume()
  return (
    <div className={cx('bullet-row', !bullet.enabled && 'disabled')}>
      <span className="bullet-dot">•</span>
      <RichTextarea
        value={bullet.text}
        placeholder="Describe an achievement or responsibility…"
        onChange={(t) => actions.updateBullet(sid, eid, bullet.id, t)}
      />
      <div className="row-tools">
        <AiMenu
          compact
          getText={() => bullet.text}
          onResult={(t) => actions.updateBullet(sid, eid, bullet.id, t)}
        />
        <IncludeToggle
          on={bullet.enabled}
          label="Bullet"
          onChange={() => actions.toggleBullet(sid, eid, bullet.id)}
        />
        <IconButton
          icon="up"
          label="Move up"
          disabled={index === 0}
          onClick={() => actions.moveBullet(sid, eid, bullet.id, -1)}
        />
        <IconButton
          icon="down"
          label="Move down"
          disabled={index === count - 1}
          onClick={() => actions.moveBullet(sid, eid, bullet.id, 1)}
        />
        <IconButton
          icon="trash"
          label="Delete bullet"
          className="danger"
          onClick={() => actions.removeBullet(sid, eid, bullet.id)}
        />
      </div>
    </div>
  )
}
