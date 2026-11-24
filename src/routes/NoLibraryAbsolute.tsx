import { useState } from 'react'
import { Dashboard } from '../shared/Dashboard'
import type { RolePickerProps } from '../shared/types'

// Version A: position: absolute inside the cell, no portal.
function Picker({ id, role, onSelect }: RolePickerProps) {
  const [open, setOpen] = useState(false)
  return (
    <span style={{ position: 'relative', display: 'inline-block' }}>
      <button type="button" className="trigger" data-testid={`trigger-${id}`} onClick={() => setOpen(!open)}>
        Role: {role}
      </button>
      {open && (
        <div className="popover" data-testid={`popover-${id}`} style={{ position: 'absolute', top: '100%', left: 0, marginTop: 8 }}>
          <p className="popover-title">Choose role</p>
          <div className="popover-options">
            {(['Admin', 'User'] as const).map((r) => (
              <button key={r} type="button" className="option" onClick={() => { onSelect(r); setOpen(false) }}>
                {r}
              </button>
            ))}
          </div>
        </div>
      )}
    </span>
  )
}

export default function NoLibraryAbsoluteRoute() {
  return <Dashboard title="No library (A): position absolute, no portal" Picker={Picker} />
}
