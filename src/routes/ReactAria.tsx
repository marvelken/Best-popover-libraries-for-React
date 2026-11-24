import { Button, Dialog, DialogTrigger, Heading, Popover } from 'react-aria-components'
import { Dashboard } from '../shared/Dashboard'
import type { RolePickerProps } from '../shared/types'

// Follows https://react-aria.adobe.com/Popover: DialogTrigger > Button + Popover > Dialog.
function Picker({ id, role, onSelect }: RolePickerProps) {
  return (
    <DialogTrigger>
      <Button className="trigger" data-testid={`trigger-${id}`}>
        Role: {role}
      </Button>
      <Popover className="popover" data-testid={`popover-${id}`}>
        <Dialog>
          {({ close }) => (
            <>
              <Heading slot="title" className="popover-title">Choose role</Heading>
              <div className="popover-options">
                {(['Admin', 'User'] as const).map((r) => (
                  <Button key={r} className="option" onPress={() => { onSelect(r); close() }}>
                    {r}
                  </Button>
                ))}
              </div>
            </>
          )}
        </Dialog>
      </Popover>
    </DialogTrigger>
  )
}

export default function ReactAriaRoute() {
  return <Dashboard title="React Aria Components" Picker={Picker} />
}
