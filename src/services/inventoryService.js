const db = require('../db/database');
const { getItem } = require('./gameDataService');

const nowIso = () => new Date().toISOString();

function getRawInventoryRows(playerId) {
  return db.prepare('SELECT * FROM inventory WHERE player_id = ? ORDER BY item_code ASC, id ASC').all(playerId);
}

function getInventory(playerId) {
  return getRawInventoryRows(playerId).map((row) => ({
    id: row.id,
    item_code: row.item_code,
    name: getItem(row.item_code).name,
    type: getItem(row.item_code).type,
    quantity: row.quantity,
    durability: row.durability
  }));
}

function getResourceTotals(playerId) {
  const totals = {};
  for (const row of getRawInventoryRows(playerId)) {
    const item = getItem(row.item_code);
    if (item.type !== 'tool') {
      totals[row.item_code] = (totals[row.item_code] || 0) + row.quantity;
    }
  }
  return totals;
}

function getTools(playerId) {
  return getRawInventoryRows(playerId)
    .filter((row) => getItem(row.item_code).type === 'tool')
    .map((row) => ({ ...row, name: getItem(row.item_code).name }));
}

function addStackableItem(playerId, itemCode, amount) {
  const now = nowIso();
  const existing = db.prepare('SELECT * FROM inventory WHERE player_id = ? AND item_code = ? AND durability IS NULL LIMIT 1').get(playerId, itemCode);
  if (existing) {
    db.prepare('UPDATE inventory SET quantity = quantity + ?, updated_at = ? WHERE id = ?').run(amount, now, existing.id);
  } else {
    db.prepare('INSERT INTO inventory (player_id, item_code, quantity, durability, updated_at) VALUES (?, ?, ?, NULL, ?)').run(playerId, itemCode, amount, now);
  }
}

function addTool(playerId, itemCode, durability = null) {
  db.prepare('INSERT INTO inventory (player_id, item_code, quantity, durability, updated_at) VALUES (?, ?, 1, ?, ?)').run(
    playerId,
    itemCode,
    durability,
    nowIso()
  );
}

function seedStarterItems(playerId) {
  const rows = getRawInventoryRows(playerId);
  if (!rows.length) {
    addTool(playerId, 'starter_stone', null);
    addTool(playerId, 'torch', null);
  }
}

function hasResources(playerId, cost) {
  const totals = getResourceTotals(playerId);
  return Object.entries(cost).every(([itemCode, amount]) => (totals[itemCode] || 0) >= amount);
}

function consumeResources(playerId, cost) {
  for (const [itemCode, amount] of Object.entries(cost)) {
    let remaining = amount;
    const rows = db.prepare(`
      SELECT * FROM inventory
      WHERE player_id = ? AND item_code = ? AND durability IS NULL
      ORDER BY id ASC
    `).all(playerId, itemCode);

    for (const row of rows) {
      if (remaining <= 0) break;
      const useAmount = Math.min(row.quantity, remaining);
      const nextQty = row.quantity - useAmount;
      remaining -= useAmount;
      if (nextQty <= 0) {
        db.prepare('DELETE FROM inventory WHERE id = ?').run(row.id);
      } else {
        db.prepare('UPDATE inventory SET quantity = ?, updated_at = ? WHERE id = ?').run(nextQty, nowIso(), row.id);
      }
    }

    if (remaining > 0) {
      throw new Error(`Not enough ${itemCode}`);
    }
  }
}

function useTool(playerId, itemCode) {
  const tool = db.prepare(`
    SELECT * FROM inventory
    WHERE player_id = ? AND item_code = ?
    ORDER BY CASE WHEN durability IS NULL THEN 0 ELSE 1 END DESC, durability DESC, id ASC
    LIMIT 1
  `).get(playerId, itemCode);

  if (!tool) {
    throw new Error(`Tool ${itemCode} not found`);
  }

  if (tool.durability === null) {
    return { broken: false, remainingDurability: null, rowId: tool.id };
  }

  const nextDurability = tool.durability - 1;
  if (nextDurability <= 0) {
    db.prepare('DELETE FROM inventory WHERE id = ?').run(tool.id);
    return { broken: true, remainingDurability: 0, rowId: tool.id };
  }

  db.prepare('UPDATE inventory SET durability = ?, updated_at = ? WHERE id = ?').run(nextDurability, nowIso(), tool.id);
  return { broken: false, remainingDurability: nextDurability, rowId: tool.id };
}

module.exports = {
  getInventory,
  getResourceTotals,
  getTools,
  addStackableItem,
  addTool,
  seedStarterItems,
  hasResources,
  consumeResources,
  useTool
};
