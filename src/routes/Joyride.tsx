import { Joyride, type Step } from 'react-joyride'
import { Dashboard } from '../shared/Dashboard'
import type { RolePickerProps } from '../shared/types'

// Static trigger: the tour points at the same dashboard, no popover needed.
function Picker({ id, role }: RolePickerProps) {
  return (
    <button type="button" className="trigger" data-testid={`trigger-${id}`}>
      Role: {role}
    </button>
  )
}

const steps: Step[] = [
  { target: 'body', placement: 'center', content: 'Welcome to the user dashboard.' },
  { target: '[data-testid="user-cell-0"]', content: 'Each row shows a user.' },
  { target: '[data-testid="trigger-0"]', content: 'Change a user role here.' },
  { target: '[data-testid="trigger-corner"]', content: 'This trigger is pinned to the corner.' },
]

// v3: named export, run defaults to false, so pass run.
export default function JoyrideRoute() {
  return (
    <>
      <Joyride continuous run steps={steps} />
      <Dashboard title="React Joyride v3 tour" Picker={Picker} />
    </>
  )
}
