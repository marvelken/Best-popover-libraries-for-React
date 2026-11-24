import { useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Dashboard } from '../shared/Dashboard'
import type { RolePickerProps } from '../shared/types'

// Version B: createPortal to document.body, position measured once when opened.
function Picker({ id, role, onSelect }: RolePickerProps) {
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const toggle = () => {
    if (pos) return setPos(null)
    const r = triggerRef.current!.getBoundingClientRect()
    setPos({ top: r.bottom + 8, left: r.left })
  }
  return (
    <>
      <button ref={triggerRef} type="button" className="trigger" data-testid={`trigger-${id}`} onClick={toggle}>
        Role: {role}
      </button>
      {pos &&
        createPortal(
          <div className="popover" data-testid={`popover-${id}`} style={{ position: 'absolute', top: pos.top, left: pos.left }}>
            <p className="popover-title">Choose role</p>
            <div className="popover-options">
              {(['Admin', 'User'] as const).map((r) => (
                <button key={r} type="button" className="option" onClick={() => { onSelect(r); setPos(null) }}>
                  {r}
                </button>
              ))}
            </div>
          </div>,
          document.body,
        )}
    </>
  )
}

export default function NoLibraryPortalRoute() {
  return <Dashboard title="No library (B): createPortal to body" Picker={Picker} />
}
