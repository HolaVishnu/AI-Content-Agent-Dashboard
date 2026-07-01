import { useYouTubePlayer } from './useYouTubePlayer';
import './MusicToggle.css';

const LABELS = {
  loading: '⏳ Loading…',
  ready: '🔇 Unmute Music',
  playing: '🔊 Playing',
  failed: '⚠ Music unavailable',
};

export function MusicToggle() {
  const { hostRef, status, toggle } = useYouTubePlayer();

  return (
    <>
      {/* Off-screen but real-dimensioned host — a 1x1 opacity:0 iframe gets
          flagged by some ad-blockers as a tracking pixel and silently killed. */}
      <div
        style={{ position: 'fixed', left: -9999, top: 0, width: 320, height: 180, pointerEvents: 'none' }}
        ref={hostRef}
        aria-hidden="true"
      />
      <button
        type="button"
        className={`music-toggle${status === 'playing' ? ' playing' : ''}`}
        onClick={toggle}
        disabled={status === 'loading' || status === 'failed'}
        aria-label="Toggle background music"
      >
        {LABELS[status]}
      </button>
    </>
  );
}
