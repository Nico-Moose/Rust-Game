const fs = require('fs');
const path = require('path');
const db = require('./database');

function hasColumn(table, column) {
  const rows = db.prepare(`PRAGMA table_info(${table})`).all();
  return rows.some((row) => row.name === column);
}

function ensureColumn(table, columnSql, columnName) {
  if (!hasColumn(table, columnName)) {
    db.exec(`ALTER TABLE ${table} ADD COLUMN ${columnSql}`);
  }
}

function ensureDbReady() {
  const schemaPath = path.resolve(__dirname, 'schema.sql');
  const schemaSql = fs.readFileSync(schemaPath, 'utf8');
  db.exec(schemaSql);

  ensureColumn('inventory', 'durability INTEGER', 'durability');

  if (!hasColumn('players', 'gold_earned_today')) {
    ensureColumn('players', 'gold_earned_today INTEGER NOT NULL DEFAULT 0', 'gold_earned_today');
  }
  if (!hasColumn('players', 'last_reward_at')) {
    ensureColumn('players', 'last_reward_at TEXT', 'last_reward_at');
  }

  db.prepare(`
    DELETE FROM inventory
    WHERE quantity <= 0
  `).run();
}

if (require.main === module) {
  ensureDbReady();
  console.log('[DB] Initialized successfully');
}

module.exports = { ensureDbReady };
