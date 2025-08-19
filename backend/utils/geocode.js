import axios from "axios";
import Bottleneck from "bottleneck";

const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";

const limiter = new Bottleneck({
  minTime: 1100, // ~בקשה אחת לשניה
  maxConcurrent: 1,
});

// cache זיכרון פשוט (אופציונלי)
const cache = new Map(); // key: normalized address, value: {lat, lng, ts}

function normalizeAddress(a) {
  return (a || "").trim().toLowerCase().replace(/\s+/g, " ");
}

export const geocodeAddress = limiter.wrap(async (address) => {
  const norm = normalizeAddress(address);
  if (!norm) return { lat: null, lng: null };

  const hit = cache.get(norm);
  if (hit) return hit;

  const params = { q: norm, format: "json", addressdetails: 0, limit: 1 };
  const headers = {
    "User-Agent": process.env.NOMINATIM_USER_AGENT || "YourAppName/1.0",
    "Accept-Language": process.env.NOMINATIM_LANG || "he",
  };

  const { data } = await axios.get(NOMINATIM_URL, { params, headers });
  const result = Array.isArray(data) ? data[0] : null;

  const coords = result
    ? { lat: parseFloat(result.lat), lng: parseFloat(result.lon) }
    : { lat: null, lng: null };

  cache.set(norm, coords);
  return coords;
});
