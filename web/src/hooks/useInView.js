import { useEffect, useRef, useState } from 'react';

// Replaces the static site's lazyInitObserver pattern: mounts heavy R3F
// scenes only once their section is scrolled near, then stays mounted (so
// scrolling back doesn't re-trigger expensive WebGL init). `rootMargin`
// defaults to one viewport ahead/behind, matching the original '100% 0px
// 100% 0px' tuning that avoided a black-frame flash on fast scrolling.
export function useInView({ root = null, rootMargin = '100% 0px 100% 0px', threshold = 0 } = {}) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || inView) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setInView(true);
          observer.disconnect();
        }
      },
      { root, rootMargin, threshold },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [root, rootMargin, threshold, inView]);

  return [ref, inView];
}
