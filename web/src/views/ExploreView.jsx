import { motion } from 'framer-motion';
import { Hero } from '../components/hero/Hero';
import { GalaxySection } from '../components/galaxy/GalaxySection';
import { UniverseSection } from '../components/universe/UniverseSection';
import { ConstellationsSection } from '../components/constellations/ConstellationsSection';

const PAGE = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.4 } },
  exit:    { opacity: 0, transition: { duration: 0.25 } },
};

export default function ExploreView() {
  return (
    <motion.div className="explore-view" variants={PAGE} initial="initial" animate="animate" exit="exit">
      <Hero />
      <GalaxySection />
      <UniverseSection />
      <ConstellationsSection />
    </motion.div>
  );
}
