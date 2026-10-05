type Bucket = { timestamps: number[] };

const store = new Map<string, Bucket>();

export function rateLimit(key: string, limit: number, windowMs = 60_000) {
  const now = Date.now();
  const bucket = store.get(key) ?? { timestamps: [] };
  bucket.timestamps = bucket.timestamps.filter((t) => now - t < windowMs);
  if (bucket.timestamps.length >= limit) {
    return { ok: false as const, remaining: 0 };
  }
  bucket.timestamps.push(now);
  store.set(key, bucket);
  return { ok: true as const, remaining: limit - bucket.timestamps.length };
}
