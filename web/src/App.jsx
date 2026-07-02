import { Suspense, lazy } from 'react';
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { CursorGlow } from './components/layout/CursorGlow';
import { StarfieldBackground } from './components/layout/StarfieldBackground';
import { useDashboardData } from './hooks/useDashboardData';

const ExploreView   = lazy(() => import('./views/ExploreView'));
const DashboardView = lazy(() => import('./views/DashboardView'));
const BriefingView  = lazy(() => import('./views/BriefingView'));

function RouteLoader() {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      minHeight: 'calc(100dvh - 64px)',
      color: 'var(--aurora)', fontFamily: 'var(--mono)',
      fontSize: 12, letterSpacing: 3, textTransform: 'uppercase',
    }}>
      Initializing…
    </div>
  );
}

// Inner component so useLocation is inside BrowserRouter
function AppShell({ data, status }) {
  const location = useLocation();

  return (
    <>
      <StarfieldBackground />
      <div className="film-grain" aria-hidden="true" />
      <CursorGlow />
      <Navbar liveStatus={status} data={data} />

      <main className="app-main">
        <Suspense fallback={<RouteLoader />}>
          <AnimatePresence mode="wait" initial={false}>
            <Routes location={location} key={location.pathname}>
              <Route path="/"          element={<ExploreView />} />
              <Route path="/dashboard" element={<DashboardView data={data} />} />
              <Route path="/briefing"  element={<BriefingView  data={data} />} />
            </Routes>
          </AnimatePresence>
        </Suspense>
      </main>

      <Footer />
    </>
  );
}

export default function App() {
  const { data, status } = useDashboardData();

  return (
    <HashRouter>
      <AppShell data={data} status={status} />
    </HashRouter>
  );
}
