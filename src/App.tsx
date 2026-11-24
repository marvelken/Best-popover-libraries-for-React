import { lazy, Suspense } from 'react'
import NoLibraryAbsolute from './routes/NoLibraryAbsolute'
import NoLibraryPortal from './routes/NoLibraryPortal'
import Native from './routes/Native'
import FloatingUi from './routes/FloatingUi'
import Radix from './routes/Radix'
import ReactAria from './routes/ReactAria'
import BaseUi from './routes/BaseUi'
import ReactTinyPopover from './routes/ReactTinyPopover'
import Joyride from './routes/Joyride'
import NativeFixed from './routes/NativeFixed'
import FloatingUiFixed from './routes/FloatingUiFixed'
import RadixFixed from './routes/RadixFixed'
import ReactTinyPopoverFixed from './routes/ReactTinyPopoverFixed'

// The index page is lazy so its code and CSS never load on the test fixture routes.
const Home = lazy(() => import('./home/Home'))

const ROUTES: Record<string, () => React.ReactNode> = {
  '/no-library': NoLibraryAbsolute,
  '/no-library-portal': NoLibraryPortal,
  '/native': Native,
  '/floating-ui': FloatingUi,
  '/radix': Radix,
  '/react-aria': ReactAria,
  '/base-ui': BaseUi,
  '/react-tiny-popover': ReactTinyPopover,
  '/joyride': Joyride,
  '/native-fixed': NativeFixed,
  '/floating-ui-fixed': FloatingUiFixed,
  '/radix-fixed': RadixFixed,
  '/react-tiny-popover-fixed': ReactTinyPopoverFixed,
}

export default function App() {
  const Route = ROUTES[window.location.pathname]
  if (Route) return <Route />
  return (
    <Suspense fallback={null}>
      <Home />
    </Suspense>
  )
}
