import * as satellite from "satellite.js";

// TLE (two-line element set) for the ISS. Orbital elements drift as the
// station maneuvers, so this goes slightly stale over weeks — good enough
// for a "roughly where it is right now" marker, not for precision tracking.
// Refresh from https://celestrak.org/NORAD/elements/gp.php?CATNR=25544&FORMAT=tle
// if the plotted position looks off.
const ISS_TLE_LINE1 =
  "1 25544U 98067A   26251.46617104  .00001902  00000+0  42648-4 0  9994";
const ISS_TLE_LINE2 =
  "2 25544  51.6295 247.9233 0004929 112.8116 247.3394 15.49040812584669";

const issSatrec = satellite.twoline2satrec(ISS_TLE_LINE1, ISS_TLE_LINE2);

export interface IssPosition {
  lat: number;
  lng: number;
  altitudeKm: number;
}

/** Propagates the ISS's TLE to `date` and returns its ground position. */
export function getIssPosition(date: Date = new Date()): IssPosition | null {
  const propagated = satellite.propagate(issSatrec, date);
  const positionEci = propagated?.position;
  if (!positionEci || typeof positionEci === "boolean") return null;

  const gmst = satellite.gstime(date);
  const geodetic = satellite.eciToGeodetic(positionEci, gmst);

  return {
    lat: satellite.degreesLat(geodetic.latitude),
    lng: satellite.degreesLong(geodetic.longitude),
    altitudeKm: geodetic.height,
  };
}
