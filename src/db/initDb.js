const fs = require('fs');
const path = require('path');
const db = require('./database');

function ensureDbReady() {
  const schemaPath = path.resolve(__dirname, 'schema.sql');
  const schemaSql = fs.readFileSync(schemaPath, 'utf8');
  db.exec(schemaSql);
}

if (require.main === module) {
  ensureDbReady();
  console.log('[DB] Initialized successfully');
}

module.exports = { ensureDbReady };
