import { useEffect, useRef, useState } from 'react'
import { Popover } from 'react-tiny-popover'
import { Dashboard } from '../shared/Dashboard'
import type { RolePickerProps } from '../shared/types'

// The library checks collisions against document.body (the whole page), not the viewport.
// A fixed, invisible, viewport-sized element gives boundaryElement the viewport's bounds.
function useViewportBoundary() {
  const [el, setEl] = useState<HTMLElement>()
  useEffect(() => {
    const div = document.createElement('div')
    Object.assign(div.style, { position: 'fixed', inset: '0', pointerEvents: 'none', visibility: 'hidden' })
    document.body.append(div)
    setEl(div)
    return () => div.remove()
  }, [])
  return el
}

// Follows the second README example: positions, padding, onClickOutside.
function Picker({ id, role, onSelect }: RolePickerProps) {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)
  const viewportBoundary = useViewportBoundary()
  const triggerRef = useRef<HTMLElement>(null)
  const firstOptionRef = useRef<HTMLButtonElement>(null)
  const popoverId = `role-popover-${id}`
  const titleId = `role-popover-title-${id}`
  // Move focus into the popover when it opens. The library mounts the content container
  // after our effect runs, so wait one frame.
  useEffect(() => {
    if (!isPopoverOpen) return
    const frame = requestAnimationFrame(() => firstOptionRef.current?.focus())
    return () => cancelAnimationFrame(frame)
  }, [isPopoverOpen])
  // Close and send focus back to the trigger.
  const closeAndReturnFocus = () => {
    setIsPopoverOpen(false)
    triggerRef.current?.focus()
  }
  return (
    <Popover
      isOpen={isPopoverOpen}
      positions={['bottom', 'top', 'left', 'right']}
      padding={8}
      onClickOutside={() => setIsPopoverOpen(false)}
      boundaryElement={viewportBoundary}
      ref={triggerRef}
      content={
        <div
          className="popover"
          data-testid={`popover-${id}`}
          id={popoverId}
          role="dialog"
          aria-labelledby={titleId}
          onKeyDown={(e) => { if (e.key === 'Escape') closeAndReturnFocus() }}
        >
          <p className="popover-title" id={titleId}>Choose role</p>
          <div className="popover-options">
            {(['Admin', 'User'] as const).map((r, i) => (
              <button key={r} ref={i === 0 ? firstOptionRef : undefined} type="button" className="option" onClick={() => { onSelect(r); closeAndReturnFocus() }}>
                {r}
              </button>
            ))}
          </div>
        </div>
      }
    >
      <button
        type="button"
        className="trigger"
        data-testid={`trigger-${id}`}
        aria-expanded={isPopoverOpen}
        aria-haspopup="dialog"
        aria-controls={isPopoverOpen ? popoverId : undefined}
        onClick={() => setIsPopoverOpen(!isPopoverOpen)}
      >
        Role: {role}
      </button>
    </Popover>
  )
}

export default function ReactTinyPopoverFixedRoute() {
  return <Dashboard title="react-tiny-popover (extra work)" Picker={Picker} />
}
