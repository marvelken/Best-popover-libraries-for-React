import { Popover } from '@base-ui/react/popover'
import { Dashboard } from '../shared/Dashboard'
import type { RolePickerProps } from '../shared/types'

// Follows node_modules/@base-ui/react/docs/react/components/popover.md (CSS Modules demo).
function Picker({ id, role, onSelect }: RolePickerProps) {
  return (
    <Popover.Root>
      <Popover.Trigger className="trigger" data-testid={`trigger-${id}`}>
        Role: {role}
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Positioner sideOffset={8}>
          <Popover.Popup className="popover" data-testid={`popover-${id}`}>
            <Popover.Title className="popover-title">Choose role</Popover.Title>
            <div className="popover-options">
              {(['Admin', 'User'] as const).map((r) => (
                <Popover.Close key={r} className="option" onClick={() => onSelect(r)}>
                  {r}
                </Popover.Close>
              ))}
            </div>
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  )
}

export default function BaseUiRoute() {
  return <Dashboard title="Base UI Popover" Picker={Picker} />
}
