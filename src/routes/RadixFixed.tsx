import { useId } from 'react'
import { Popover } from 'radix-ui'
import { Dashboard } from '../shared/Dashboard'
import type { RolePickerProps } from '../shared/types'

// Follows the Radix Popover anatomy: Root > Trigger, Portal > Content > Close.
function Picker({ id, role, onSelect }: RolePickerProps) {
  const titleId = useId()
  return (
    <Popover.Root>
      <Popover.Trigger className="trigger" data-testid={`trigger-${id}`}>
        Role: {role}
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content className="popover" data-testid={`popover-${id}`} sideOffset={8} aria-labelledby={titleId}>
          <p className="popover-title" id={titleId}>Choose role</p>
          <div className="popover-options">
            {(['Admin', 'User'] as const).map((r) => (
              <Popover.Close key={r} className="option" onClick={() => onSelect(r)}>
                {r}
              </Popover.Close>
            ))}
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}

export default function RadixFixedRoute() {
  return <Dashboard title="Radix Popover (extra work)" Picker={Picker} />
}
