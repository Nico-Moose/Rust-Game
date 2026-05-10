const db = require('../db/database');

const nowIso = () => new Date().toISOString();

function getPlayerById(id) {
  return db.prepare('SELECT * FROM players WHERE id = ?').get(id);
}

function getPlayerByTwitchId(twitchId) {
  return db.prepare('SELECT * FROM players WHERE twitch_id = ?').get(twitchId);
}

function createPlayerFromTwitchProfile(profile) {
  const createdAt = nowIso();
  const insert = db.prepare(`
    INSERT INTO players (
      twitch_id, login, display_name, email, avatar_url,
      hp, hunger, energy, x, y, scrap, created_at, last_login_at
    ) VALUES (?, ?, ?, ?, ?, 100, 100, 100, 12, 12, ?, ?, ?)
  `);

  const result = insert.run(
    profile.id,
    profile.username || profile.login || profile.display_name,
    profile.display_name || profile.username || 'Unknown',
    profile.email || null,
    profile.profile_image_url || profile._json?.profile_image_url || null,
    Number(process.env.START_SCRAP_BONUS || 25),
    createdAt,
    createdAt
  );

  addLog(result.lastInsertRowid, 'player_created', JSON.stringify({ twitch_id: profile.id }));
  return getPlayerById(result.lastInsertRowid);
}

function updateLastLogin(id) {
  db.prepare('UPDATE players SET last_login_at = ? WHERE id = ?').run(nowIso(), id);
}

function findOrCreateFromTwitchProfile(profile) {
  let player = getPlayerByTwitchId(profile.id);
  if (!player) {
    player = createPlayerFromTwitchProfile(profile);
  } else {
    updateLastLogin(player.id);
    player = getPlayerById(player.id);
  }
  return player;
}

function movePlayer(id, direction) {
  const player = getPlayerById(id);
  if (!player) {
    throw new Error('Player not found');
  }

  const deltas = {
    up: { x: 0, y: -1 },
    down: { x: 0, y: 1 },
    left: { x: -1, y: 0 },
    right: { x: 1, y: 0 }
  };

  const delta = deltas[direction];
  if (!delta) {
    throw new Error('Invalid direction');
  }

  const nextX = Math.max(0, Math.min(24, player.x + delta.x));
  const nextY = Math.max(0, Math.min(24, player.y + delta.y));

  db.prepare('UPDATE players SET x = ?, y = ? WHERE id = ?').run(nextX, nextY, id);
  addLog(id, 'move', JSON.stringify({ direction, x: nextX, y: nextY }));
  return getPlayerById(id);
}

function addLog(playerId, actionType, actionData) {
  db.prepare(
    'INSERT INTO action_logs (player_id, action_type, action_data, created_at) VALUES (?, ?, ?, ?)'
  ).run(playerId, actionType, actionData || null, nowIso());
}

function getPlayerLogs(playerId, limit = 20) {
  return db
    .prepare('SELECT * FROM action_logs WHERE player_id = ? ORDER BY id DESC LIMIT ?')
    .all(playerId, limit);
}

function incrementGoldEarnedToday(playerId, amount) {
  db.prepare('UPDATE players SET gold_earned_today = gold_earned_today + ?, last_reward_at = ? WHERE id = ?').run(
    amount,
    nowIso(),
    playerId
  );
}

module.exports = {
  getPlayerById,
  getPlayerByTwitchId,
  findOrCreateFromTwitchProfile,
  movePlayer,
  addLog,
  getPlayerLogs,
  incrementGoldEarnedToday
};
