const gatherTable = {
  forest: { itemCode: 'wood', min: 3, max: 8 },
  stone: { itemCode: 'stone', min: 2, max: 6 },
  metal: { itemCode: 'metal_ore', min: 1, max: 4 },
  field: { itemCode: 'food', min: 1, max: 3 },
  scrap: { itemCode: 'components', min: 1, max: 2 },
  safe_zone: { itemCode: 'cloth', min: 1, max: 2 }
};

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function gatherFromTile(player, tile) {
  const rule = gatherTable[tile.type];
  if (!rule) {
    throw new Error('Nothing to gather here');
  }

  return {
    itemCode: rule.itemCode,
    amount: randomInt(rule.min, rule.max),
    tileType: tile.type,
    x: tile.x,
    y: tile.y
  };
}

module.exports = {
  gatherFromTile
};
