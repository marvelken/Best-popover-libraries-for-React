import { useRef, useState } from 'react'
import { Dashboard } from '../shared/Dashboard'
import type { RolePickerProps } from '../shared/types'

// Native Popover API (React 19 props) + CSS anchor positioning. No JS positioning.
function Picker({ id, role, onSelect }: RolePickerProps) {
  const [open, setOpen] = useState(false)
  const popoverRef = useRef<HTMLDivElement>(null)
  const popoverId = `role-popover-${id}`
  const anchor = `--role-anchor-${id}`
  return (
    <>
      <button
        type="button"
        className="trigger"
        data-testid={`trigger-${id}`}
        popoverTarget={popoverId}
        style={{ anchorName: anchor }}
      >
        Role: {role}
      </button>
      <div
        id={popoverId}
        popover="auto"
        className="popover native-popover"
        data-testid={`popover-${id}`}
        data-open={open}
        ref={popoverRef}
        onToggle={(e) => setOpen(e.newState === 'open')}
        style={{ positionAnchor: anchor }}
      >
        <p className="popover-title">Choose role</p>
        <div className="popover-options">
          {(['Admin', 'User'] as const).map((r) => (
            <button key={r} type="button" className="option" onClick={() => { onSelect(r); popoverRef.current?.hidePopover() }}>
              {r}
            </button>
          ))}
        </div>
      </div>
    </>
  )
}

export default function NativeRoute() {
  return <Dashboard title="Native Popover API + CSS anchor positioning" Picker={Picker} />
}
