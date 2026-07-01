import { useEffect, useRef, useState } from 'react';

// "Mortals" — Warriyo ft. Laura Brehm [NCS Release], verified via ncs.io/mortals
// (the official NCS catalog page) — see CLAUDE.md/session notes for why this
// specific track: every other candidate offered during development turned out
// to be an unlicensed reupload or "NCS fanmade" remix, not a genuine release.
const YT_VIDEO_ID = 'yJg-Y5byMMw';

// Module-scoped guards: React 19 StrictMode mounts effects twice in dev, and
// the YouTube IFrame API has exactly one global callback — without these,
// dev mode would inject the script twice and/or create two players.
let apiScriptInjected = false;
let apiReadyCallbacks = [];
let apiIsReady = false;

function ensureYouTubeApiLoaded(onReady) {
  if (apiIsReady) { onReady(); return; }
  apiReadyCallbacks.push(onReady);
  if (apiScriptInjected) return;
  apiScriptInjected = true;

  window.onYouTubeIframeAPIReady = () => {
    apiIsReady = true;
    apiReadyCallbacks.forEach((cb) => cb());
    apiReadyCallbacks = [];
  };
  const script = document.createElement('script');
  script.src = 'https://www.youtube.com/iframe_api';
  document.head.appendChild(script);
}

// Ports the static site's background-music logic verbatim: browsers block
// autoplay WITH sound before any user gesture (a hard platform rule, not
// something any site can override) — so we autoplay MUTED the instant the
// page loads, and the toggle button just unmutes already-playing audio
// instead of starting playback from a click.
export function useYouTubePlayer() {
  const hostRef = useRef(null);
  const playerRef = useRef(null);
  const [status, setStatus] = useState('loading'); // loading | ready | playing | failed
  const createdRef = useRef(false);

  useEffect(() => {
    const failTimer = setTimeout(() => {
      setStatus((s) => (s === 'loading' ? 'failed' : s));
    }, 8000);

    ensureYouTubeApiLoaded(() => {
      if (createdRef.current || !hostRef.current) return;
      createdRef.current = true;
      playerRef.current = new window.YT.Player(hostRef.current, {
        height: '180',
        width: '320',
        videoId: YT_VIDEO_ID,
        playerVars: { autoplay: 1, mute: 1, controls: 0, loop: 1, playlist: YT_VIDEO_ID, playsinline: 1 },
        events: {
          onReady: (e) => {
            e.target.playVideo();
            setStatus('ready');
          },
          onStateChange: (e) => {
            if (e.data === window.YT.PlayerState.ENDED) playerRef.current.playVideo(); // manual loop
          },
          onError: () => setStatus('failed'),
        },
      });
    });

    return () => clearTimeout(failTimer);
  }, []);

  function toggle() {
    if (status === 'failed' || status === 'loading' || !playerRef.current) return;
    if (status === 'ready') {
      playerRef.current.unMute();
      setStatus('playing');
    } else {
      playerRef.current.mute();
      setStatus('ready');
    }
  }

  return { hostRef, status, toggle };
}
