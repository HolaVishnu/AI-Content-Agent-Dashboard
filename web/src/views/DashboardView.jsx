import { motion } from 'framer-motion';
import { TelemetryStrip } from '../components/dashboard/TelemetryStrip';
import { TopPostsPanel } from '../components/dashboard/TopPostsPanel';
import { CompetitorsPanel } from '../components/dashboard/CompetitorsPanel';
import { CalendarPanel } from '../components/dashboard/CalendarPanel';
import { LaunchesPanel } from '../components/dashboard/LaunchesPanel';
import { SpaceWeatherPanel } from '../components/dashboard/SpaceWeatherPanel';
import { ISSPanel } from '../components/dashboard/ISSPanel';
import { ApodPanel, MarsRoverPanel, NasaGalleryPanel } from '../components/dashboard/NasaApiPanels';
import '../components/dashboard/Dashboard.css';

const PAGE = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.4, ease: [0.16, 0.8, 0.24, 1] } },
  exit:    { opacity: 0, transition: { duration: 0.25 } },
};

export default function DashboardView({ data }) {
  return (
    <motion.div className="dashboard-view" variants={PAGE} initial="initial" animate="animate" exit="exit">
      <TelemetryStrip data={data} />

      <div className="dashboard-main">
        <div className="section-label">ISS Command</div>
        <ISSPanel />

        <div className="section-label">NASA Live Feed</div>
        <div className="nasa-grid">
          <ApodPanel />
          <MarsRoverPanel />
          <NasaGalleryPanel />
        </div>

        <div className="section-label">Transmission Analytics</div>
        <div className="bottom-grid">
          <TopPostsPanel data={data} />
          <CompetitorsPanel data={data} />
          <CalendarPanel />
        </div>

        <div className="section-label">Live Space Intel</div>
        <div className="live-grid">
          <LaunchesPanel />
          <SpaceWeatherPanel />
        </div>

      </div>
    </motion.div>
  );
}
