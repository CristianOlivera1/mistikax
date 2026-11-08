type Bucket = {
  count: number;
  resetAt: number;
};

const MAX_BUCKETS = 5000;
const buckets = new Map<string, Bucket>();

function purgeExpired(now: number) {
  if (buckets.size < MAX_BUCKETS) return;

  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}

export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number,
): { ok: boolean } {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    purgeExpired(now);
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true };
  }

  if (bucket.count >= limit) return { ok: false };

  bucket.count += 1;
  return { ok: true };
}
