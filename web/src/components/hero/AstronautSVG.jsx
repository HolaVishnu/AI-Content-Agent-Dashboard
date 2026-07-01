// Ported verbatim from dashboard/app.js ASTRONAUT_SVG — inline SVG with CSS
// animateTransform for the orbiting planets inside the portrait circle.
export function AstronautSVG() {
  return (
    <svg viewBox="0 0 240 240" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
      <defs>
        <radialGradient id="astronaut-bg" cx="50%" cy="38%" r="75%">
          <stop offset="0%" stopColor="#1c1c3a"/>
          <stop offset="100%" stopColor="#07070f"/>
        </radialGradient>
        <linearGradient id="astronaut-suit" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#e8e8ff"/>
          <stop offset="100%" stopColor="#9b9bd0"/>
        </linearGradient>
        <radialGradient id="astronaut-visor" cx="35%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#bfffe9"/>
          <stop offset="45%" stopColor="#00c9b0"/>
          <stop offset="100%" stopColor="#063b34"/>
        </radialGradient>
        <radialGradient id="astronaut-sun" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fff7c2"/>
          <stop offset="55%" stopColor="#ffcf3f"/>
          <stop offset="100%" stopColor="#ff8c1a"/>
        </radialGradient>
      </defs>

      <rect width="240" height="240" fill="url(#astronaut-bg)"/>
      <circle cx="32" cy="34" r="1.3" fill="#fff" opacity="0.7"/>
      <circle cx="208" cy="50" r="1" fill="#fff" opacity="0.6"/>
      <circle cx="20" cy="150" r="1.4" fill="#fff" opacity="0.6"/>
      <circle cx="216" cy="190" r="1" fill="#fff" opacity="0.5"/>

      {/* Animated mini solar system */}
      <g transform="translate(120,88)">
        <circle r="8.5" fill="url(#astronaut-sun)"/>
        <circle r="15" fill="none" stroke="#FFD700" opacity="0.18"/>

        <g transform="scale(1,0.42)">
          <ellipse r="26" fill="none" stroke="#9B7FE0" strokeWidth="1" opacity="0.4"/>
          <g>
            <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="4s" repeatCount="indefinite"/>
            <circle cx="26" cy="0" r="2.6" fill="#4d96ff"/>
          </g>
        </g>

        <g transform="scale(1,0.42)">
          <ellipse r="40" fill="none" stroke="#9B7FE0" strokeWidth="1" opacity="0.32"/>
          <g>
            <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="7s" repeatCount="indefinite"/>
            <circle cx="40" cy="0" r="2.1" fill="#d1542e"/>
          </g>
        </g>

        <g transform="scale(1,0.42)">
          <ellipse r="55" fill="none" stroke="#9B7FE0" strokeWidth="1" opacity="0.24"/>
          <g>
            <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="11s" repeatCount="indefinite"/>
            <circle cx="55" cy="0" r="3.4" fill="#ead6a8"/>
            <ellipse cx="55" cy="0" rx="6" ry="1.6" fill="none" stroke="#C9B98A" strokeWidth="0.8"/>
          </g>
        </g>
      </g>

      {/* Astronaut */}
      <g transform="translate(120,178) scale(0.78)">
        <rect x="-28" y="-8" width="56" height="68" rx="14" fill="#3a3a5e"/>
        <ellipse cx="0" cy="42" rx="46" ry="52" fill="url(#astronaut-suit)"/>
        <ellipse cx="0" cy="42" rx="46" ry="52" fill="none" stroke="#6a6ab0" strokeWidth="2" opacity="0.5"/>
        <rect x="-20" y="22" width="40" height="26" rx="5" fill="#1b1b38"/>
        <circle cx="-10" cy="35" r="3" fill="#00F5D4"/>
        <circle cx="0" cy="35" r="3" fill="#FFD700"/>
        <circle cx="10" cy="35" r="3" fill="#FF4466"/>
        <rect x="-14" y="40" width="28" height="4" rx="2" fill="#444470"/>
        <ellipse cx="-46" cy="-6" rx="15" ry="32" fill="url(#astronaut-suit)" transform="rotate(-48 -46 -6)"/>
        <circle cx="-66" cy="-30" r="12" fill="#cfcfe8"/>
        <ellipse cx="52" cy="38" rx="16" ry="34" fill="url(#astronaut-suit)" transform="rotate(18 52 38)"/>
        <circle cx="62" cy="72" r="13" fill="#cfcfe8"/>
        <circle cx="0" cy="-32" r="50" fill="url(#astronaut-suit)"/>
        <circle cx="0" cy="-32" r="50" fill="none" stroke="#6a6ab0" strokeWidth="2" opacity="0.5"/>
        <circle cx="0" cy="-30" r="37" fill="url(#astronaut-visor)"/>
        <ellipse cx="-14" cy="-45" rx="13" ry="7" fill="#ffffff" opacity="0.35"/>
        <circle cx="14" cy="-18" r="5" fill="#FFD700" opacity="0.85"/>
      </g>
    </svg>
  );
}
