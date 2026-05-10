const inventoryService = require('./inventoryService');
const playerService = require('./playerService');
const { getRecipes, getItem } = require('./gameDataService');

function getRecipesForPlayer(playerId) {
  const totals = inventoryService.getResourceTotals(playerId);
  return getRecipes().map((recipe) => {
    const missing = {};
    for (const [itemCode, amount] of Object.entries(recipe.cost)) {
      const have = totals[itemCode] || 0;
      if (have < amount) {
        missing[itemCode] = amount - have;
      }
    }
    return {
      ...recipe,
      canCraft: Object.keys(missing).length === 0,
      missing
    };
  });
}

function craft(playerId, recipeCode) {
  const recipe = getRecipes().find((entry) => entry.code === recipeCode);
  if (!recipe) {
    throw new Error('Рецепт не найден');
  }
  if (!inventoryService.hasResources(playerId, recipe.cost)) {
    throw new Error('Не хватает ресурсов для крафта');
  }

  inventoryService.consumeResources(playerId, recipe.cost);
  inventoryService.addTool(playerId, recipe.creates.item_code, recipe.creates.durability || getItem(recipe.creates.item_code).durability || null);
  playerService.addLog(playerId, 'craft', JSON.stringify({ recipe: recipe.code }));

  return {
    ok: true,
    recipe: recipe.code,
    item_code: recipe.creates.item_code,
    name: getItem(recipe.creates.item_code).name
  };
}

module.exports = {
  getRecipesForPlayer,
  craft
};
