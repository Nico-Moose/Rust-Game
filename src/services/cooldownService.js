const db = require('../db/database');

const nowIso = () => new Date().toISOString();
const GATHER_COOLDOWN_MS = 5 * 60 * 1000;

function getCooldown(playerId, cooldownType = 'gather') {
  return db.prepare('SELECT * FROM cooldowns WHERE player_id = ? AND cooldown_type = ?').get(playerId, cooldownType);
}

function getRemainingMs(playerId, cooldownType = 'gather') {
  const row = getCooldown(playerId, cooldownType);
  if (!row) return 0;
  const remaining = new Date(row.ready_at).getTime() - Date.now();
  return Math.max(0, remaining);
}

function startCooldown(playerId, cooldownType = 'gather', durationMs = GATHER_COOLDOWN_MS) {
  const readyAt = new Date(Date.now() + durationMs).toISOString();
  const existing = getCooldown(playerId, cooldownType);
  if (existing) {
    db.prepare('UPDATE cooldowns SET ready_at = ?, updated_at = ? WHERE id = ?').run(readyAt, nowIso(), existing.id);
  } else {
    db.prepare('INSERT INTO cooldowns (player_id, cooldown_type, ready_at, updated_at) VALUES (?, ?, ?, ?)').run(
      playerId,
      cooldownType,
      readyAt,
      nowIso()
    );
  }
  return readyAt;
}

module.exports = {
  GATHER_COOLDOWN_MS,
  getRemainingMs,
  startCooldown
};
