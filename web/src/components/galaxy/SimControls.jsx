export function SimControls({ simRunning, setSimRunning, timeWarp, setTimeWarp }) {
  return (
    <div className="sim-controls">
      <button
        className="sim-btn"
        onClick={() => setSimRunning((r) => !r)}
        title={simRunning ? 'Pause simulation' : 'Resume simulation'}
      >
        {simRunning ? '⏸' : '▶'}
      </button>

      <div className="sim-warp">
        <span className="sim-warp-label">TIME WARP</span>
        <input
          type="range"
          className="sim-warp-slider"
          min="1"
          max="200"
          step="1"
          value={timeWarp}
          onChange={(e) => setTimeWarp(Number(e.target.value))}
        />
        <span className="sim-warp-value">{timeWarp}×</span>
      </div>
    </div>
  );
}
