import { useState } from 'react'
import { Popover } from 'react-tiny-popover'
import { Dashboard } from '../shared/Dashboard'
import type { RolePickerProps } from '../shared/types'

// Follows the second README example: positions, padding, onClickOutside.
function Picker({ id, role, onSelect }: RolePickerProps) {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)
  return (
    <Popover
      isOpen={isPopoverOpen}
      positions={['bottom', 'top', 'left', 'right']}
      padding={8}
      onClickOutside={() => setIsPopoverOpen(false)}
      content={
        <div className="popover" data-testid={`popover-${id}`}>
          <p className="popover-title">Choose role</p>
          <div className="popover-options">
            {(['Admin', 'User'] as const).map((r) => (
              <button key={r} type="button" className="option" onClick={() => { onSelect(r); setIsPopoverOpen(false) }}>
                {r}
              </button>
            ))}
          </div>
        </div>
      }
    >
      <button type="button" className="trigger" data-testid={`trigger-${id}`} onClick={() => setIsPopoverOpen(!isPopoverOpen)}>
        Role: {role}
      </button>
    </Popover>
  )
}

export default function ReactTinyPopoverRoute() {
  return <Dashboard title="react-tiny-popover" Picker={Picker} />
}
