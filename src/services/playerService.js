const db = require('../db/database');
const inventoryService = require('./inventoryService');

const nowIso = () => new Date().toISOString();

function getPlayerById(id) {
  return db.prepare('SELECT * FROM players WHERE id = ?').get(id);
}

function getPlayerByTwitchId(twitchId) {
  return db.prepare('SELECT * FROM players WHERE twitch_id = ?').get(twitchId);
}

function addLog(playerId, actionType, actionData) {
  db.prepare(
    'INSERT INTO action_logs (player_id, action_type, action_data, created_at) VALUES (?, ?, ?, ?)'
  ).run(playerId, actionType, actionData || null, nowIso());
}

function getPlayerLogs(playerId, limit = 20) {
  return db.prepare('SELECT * FROM action_logs WHERE player_id = ? ORDER BY id DESC LIMIT ?').all(playerId, limit);
}

function createPlayerFromTwitchProfile(profile) {
  const createdAt = nowIso();
  const result = db.prepare(`
    INSERT INTO players (
      twitch_id, login, display_name, email, avatar_url,
      hp, hunger, energy, x, y, scrap, created_at, last_login_at
    ) VALUES (?, ?, ?, ?, ?, 100, 100, 100, 12, 12, 0, ?, ?)
  `).run(
    profile.id,
    profile.username || profile.login || profile.display_name,
    profile.display_name || profile.username || 'Unknown',
    profile.email || null,
    profile.profile_image_url || profile._json?.profile_image_url || null,
    createdAt,
    createdAt
  );

  inventoryService.seedStarterItems(result.lastInsertRowid);
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
    inventoryService.seedStarterItems(player.id);
    player = getPlayerById(player.id);
  }
  return player;
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
  addLog,
  getPlayerLogs,
  incrementGoldEarnedToday
};
