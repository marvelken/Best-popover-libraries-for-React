import { useState } from 'react'
import {
  useFloating,
  autoUpdate,
  offset,
  flip,
  shift,
  useClick,
  useDismiss,
  useRole,
  useInteractions,
  FloatingFocusManager,
  FloatingPortal,
} from '@floating-ui/react'
import { Dashboard } from '../shared/Dashboard'
import type { RolePickerProps } from '../shared/types'

// Follows https://floating-ui.com/docs/popover, plus FloatingPortal (requested in the brief).
function Picker({ id, role, onSelect }: RolePickerProps) {
  const [isOpen, setIsOpen] = useState(false)

  const { refs, floatingStyles, context } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    middleware: [offset(10), flip(), shift()],
    whileElementsMounted: autoUpdate,
  })

  const click = useClick(context)
  const dismiss = useDismiss(context)
  const ariaRole = useRole(context)
  const { getReferenceProps, getFloatingProps } = useInteractions([click, dismiss, ariaRole])

  return (
    <>
      <button ref={refs.setReference} type="button" className="trigger" data-testid={`trigger-${id}`} {...getReferenceProps()}>
        Role: {role}
      </button>
      {isOpen && (
        <FloatingPortal>
          <FloatingFocusManager context={context} modal={false}>
            <div ref={refs.setFloating} className="popover" data-testid={`popover-${id}`} style={floatingStyles} {...getFloatingProps()}>
              <p className="popover-title">Choose role</p>
              <div className="popover-options">
                {(['Admin', 'User'] as const).map((r) => (
                  <button key={r} type="button" className="option" onClick={() => { onSelect(r); setIsOpen(false) }}>
                    {r}
                  </button>
                ))}
              </div>
            </div>
          </FloatingFocusManager>
        </FloatingPortal>
      )}
    </>
  )
}

export default function FloatingUiRoute() {
  return <Dashboard title="Floating UI" Picker={Picker} />
}
