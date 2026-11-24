import { Popover } from 'radix-ui'
import { Dashboard } from '../shared/Dashboard'
import type { RolePickerProps } from '../shared/types'

// Follows the Radix Popover anatomy: Root > Trigger, Portal > Content > Close.
function Picker({ id, role, onSelect }: RolePickerProps) {
  return (
    <Popover.Root>
      <Popover.Trigger className="trigger" data-testid={`trigger-${id}`}>
        Role: {role}
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content className="popover" data-testid={`popover-${id}`} sideOffset={8}>
          <p className="popover-title">Choose role</p>
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

export default function RadixRoute() {
  return <Dashboard title="Radix Popover" Picker={Picker} />
}
