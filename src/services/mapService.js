const TILE_TYPES = ['forest', 'stone', 'metal', 'field', 'scrap', 'safe_zone'];

function tileTypeForCoords(x, y) {
  if (x >= 10 && x <= 14 && y >= 10 && y <= 14) {
    return 'safe_zone';
  }

  const hash = (x * 17 + y * 31) % TILE_TYPES.length;
  return TILE_TYPES[hash];
}

function getTileAt(x, y) {
  return {
    x,
    y,
    type: tileTypeForCoords(x, y)
  };
}

function getVisibleMap(centerX, centerY, radius = 4) {
  const rows = [];
  for (let y = centerY - radius; y <= centerY + radius; y += 1) {
    const row = [];
    for (let x = centerX - radius; x <= centerX + radius; x += 1) {
      if (x < 0 || y < 0 || x > 24 || y > 24) {
        row.push({ x, y, type: 'void' });
      } else {
        row.push(getTileAt(x, y));
      }
    }
    rows.push(row);
  }
  return rows;
}

module.exports = {
  getTileAt,
  getVisibleMap
};
