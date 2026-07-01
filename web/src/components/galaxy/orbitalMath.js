// Solve Kepler's equation M = E - e·sin(E) for eccentric anomaly E via Newton-Raphson.
export function solveKepler(M, e) {
  let E = M;
  for (let i = 0; i < 8; i++) E -= (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E));
  return E;
}

// Position (scene-space x, z + real heliocentric distance r in AU) for a comet right now.
export function cometPositionNow(comet, now) {
  const epochMs = new Date(comet.epoch).getTime();
  const periodDays = comet.period * 365.25;
  const n = (2 * Math.PI) / periodDays;
  const daysSincePerihelion = (now.getTime() - epochMs) / 86400000;
  const M = (((daysSincePerihelion * n) % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
  const E = solveKepler(M, comet.e);
  const nu = 2 * Math.atan2(
    Math.sqrt(1 + comet.e) * Math.sin(E / 2),
    Math.sqrt(1 - comet.e) * Math.cos(E / 2),
  );
  const rAU = comet.a * (1 - comet.e * Math.cos(E));
  const rScene = comet.sceneA * (1 - comet.e * Math.cos(E));
  const angle = nu + (comet.omega * Math.PI / 180);
  return { x: Math.cos(angle) * rScene, z: Math.sin(angle) * rScene, rAU };
}

// Next time the comet's heliocentric distance crosses Earth's orbit (~1 AU).
export function nextEarthOrbitCrossing(comet, now) {
  const q = comet.a * (1 - comet.e);
  const Q = comet.a * (1 + comet.e);
  if (1 < q || 1 > Q) return null;

  const periodDays = comet.period * 365.25;
  const n = (2 * Math.PI) / periodDays;
  const cosNu = Math.max(-1, Math.min(1, (comet.a * (1 - comet.e * comet.e) / 1 - 1) / comet.e));
  const nu0 = Math.acos(cosNu);
  const epochMs = new Date(comet.epoch).getTime();

  const dateForNu = (nu) => {
    const E = 2 * Math.atan2(
      Math.sqrt(1 - comet.e) * Math.sin(nu / 2),
      Math.sqrt(1 + comet.e) * Math.cos(nu / 2),
    );
    const M = E - comet.e * Math.sin(E);
    const daysFromPerihelion = M / n;
    let t = epochMs + daysFromPerihelion * 86400000;
    const periodMs = periodDays * 86400000;
    while (t < now.getTime()) t += periodMs;
    return t;
  };

  return new Date(Math.min(dateForNu(nu0), dateForNu(-nu0)));
}
