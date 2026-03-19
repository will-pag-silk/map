const DEG_TO_RAD = Math.PI / 180;

export function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * DEG_TO_RAD;
  const dLng = (lng2 - lng1) * DEG_TO_RAD;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * DEG_TO_RAD) * Math.cos(lat2 * DEG_TO_RAD) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.asin(Math.sqrt(a));
}

export function calculateScore(distanceKm: number): number {
  return Math.max(0, Math.round(100 * (1 - distanceKm / 5000)));
}

export function greatCircleArc(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
  steps = 64
): [number, number][] {
  const toRad = DEG_TO_RAD;
  const φ1 = lat1 * toRad;
  const λ1 = lng1 * toRad;
  const φ2 = lat2 * toRad;
  const λ2 = lng2 * toRad;

  // Convert to 3D unit vectors
  const x1 = Math.cos(φ1) * Math.cos(λ1);
  const y1 = Math.cos(φ1) * Math.sin(λ1);
  const z1 = Math.sin(φ1);

  const x2 = Math.cos(φ2) * Math.cos(λ2);
  const y2 = Math.cos(φ2) * Math.sin(λ2);
  const z2 = Math.sin(φ2);

  const dot = x1 * x2 + y1 * y2 + z1 * z2;
  const omega = Math.acos(Math.min(1, Math.max(-1, dot)));

  const points: [number, number][] = [];

  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    let px: number, py: number, pz: number;

    if (Math.abs(omega) < 1e-10) {
      px = x1; py = y1; pz = z1;
    } else {
      const sinOmega = Math.sin(omega);
      const a = Math.sin((1 - t) * omega) / sinOmega;
      const b = Math.sin(t * omega) / sinOmega;
      px = a * x1 + b * x2;
      py = a * y1 + b * y2;
      pz = a * z1 + b * z2;
    }

    const lat = Math.atan2(pz, Math.sqrt(px * px + py * py)) / toRad;
    const lng = Math.atan2(py, px) / toRad;
    points.push([lng, lat]);
  }

  return points;
}
