/**
 * In-memory slot lock store.
 * Key: "turfId:date:timeSlot"
 * Value: { userId, expiresAt }
 *
 * Locks expire after LOCK_TTL_MS (2 minutes).
 * No external dependency needed — works across all requests in the same process.
 */

const LOCK_TTL_MS = 2 * 60 * 1000; // 2 minutes

const locks = new Map();

/** Remove all expired locks */
function purgeExpired() {
  const now = Date.now();
  for (const [key, val] of locks.entries()) {
    if (val.expiresAt <= now) locks.delete(key);
  }
}

function lockKey(turfId, date, timeSlot) {
  return `${turfId}:${date}:${timeSlot}`;
}

/**
 * Try to acquire a lock for a slot.
 * Returns { ok: true, expiresAt } on success.
 * Returns { ok: false, lockedBy: 'you'|'other', expiresAt } on failure.
 */
function acquireLock(turfId, date, timeSlot, userId) {
  purgeExpired();
  const key = lockKey(turfId, date, timeSlot);
  const existing = locks.get(key);

  if (existing) {
    const isSameUser = String(existing.userId) === String(userId);
    if (isSameUser) {
      // Refresh the lock
      existing.expiresAt = Date.now() + LOCK_TTL_MS;
      return { ok: true, expiresAt: existing.expiresAt };
    }
    return { ok: false, lockedBy: 'other', expiresAt: existing.expiresAt };
  }

  const expiresAt = Date.now() + LOCK_TTL_MS;
  locks.set(key, { userId, expiresAt });
  return { ok: true, expiresAt };
}

/**
 * Release a lock held by a specific user.
 */
function releaseLock(turfId, date, timeSlot, userId) {
  purgeExpired();
  const key = lockKey(turfId, date, timeSlot);
  const existing = locks.get(key);
  if (existing && String(existing.userId) === String(userId)) {
    locks.delete(key);
    return true;
  }
  return false;
}

/**
 * Check if a slot is locked by someone other than userId.
 * Pass userId=null to check without ownership context.
 */
function isLockedByOther(turfId, date, timeSlot, userId) {
  purgeExpired();
  const key = lockKey(turfId, date, timeSlot);
  const existing = locks.get(key);
  if (!existing) return false;
  return String(existing.userId) !== String(userId);
}

/**
 * Get lock info for a slot (or null if not locked).
 */
function getLock(turfId, date, timeSlot) {
  purgeExpired();
  return locks.get(lockKey(turfId, date, timeSlot)) || null;
}

/**
 * Get all active locks for a turf+date as a map: timeSlot -> expiresAt
 * Used by the availability endpoint so the frontend can show lock timers.
 */
function getLocksForTurfDate(turfId, date) {
  purgeExpired();
  const result = {};
  for (const [key, val] of locks.entries()) {
    const [kTurf, kDate, ...slotParts] = key.split(':');
    if (kTurf === String(turfId) && kDate === date) {
      result[slotParts.join(':')] = val.expiresAt;
    }
  }
  return result;
}

module.exports = { acquireLock, releaseLock, isLockedByOther, getLock, getLocksForTurfDate, LOCK_TTL_MS };
