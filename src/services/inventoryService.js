const db = require('../db/database');

function getInventory(playerId) {
  return db.prepare('SELECT item_code, quantity FROM inventory WHERE player_id = ? ORDER BY item_code ASC').all(playerId);
}

function addItem(playerId, itemCode, amount) {
  const existing = db.prepare('SELECT * FROM inventory WHERE player_id = ? AND item_code = ?').get(playerId, itemCode);
  const now = new Date().toISOString();

  if (existing) {
    db.prepare('UPDATE inventory SET quantity = quantity + ?, updated_at = ? WHERE id = ?').run(amount, now, existing.id);
    return;
  }

  db.prepare('INSERT INTO inventory (player_id, item_code, quantity, updated_at) VALUES (?, ?, ?, ?)').run(
    playerId,
    itemCode,
    amount,
    now
  );
}

module.exports = {
  getInventory,
  addItem
};
