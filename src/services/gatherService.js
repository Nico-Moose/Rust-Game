const inventoryService = require('./inventoryService');
const cooldownService = require('./cooldownService');
const playerService = require('./playerService');
const rewardService = require('./rewardService');
const { getAnimalList, getBarrelLootTable, getItem } = require('./gameDataService');

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function weightedPick(entries) {
  const total = entries.reduce((sum, entry) => sum + entry.weight, 0);
  let roll = Math.random() * total;
  for (const entry of entries) {
    roll -= entry.weight;
    if (roll <= 0) return entry;
  }
  return entries[entries.length - 1];
}

const TOOL_RULES = {
  starter_stone: {
    wood: { amount: 20 },
    stone: { amount: 20 },
    sulfur: { amount: 20 },
    metal: { amount: 20 },
    barrel: { mode: 'barrel_basic' },
    hunt: { mode: 'hunt_basic' }
  },
  stone_pickaxe: {
    stone: { amount: 40 },
    sulfur: { amount: 40 },
    metal: { amount: 40 },
    barrel: { mode: 'barrel_improved' },
    hunt: { mode: 'hunt_basic' }
  },
  stone_hatchet: {
    wood: { amount: 40 },
    barrel: { mode: 'barrel_improved' },
    hunt: { mode: 'hunt_improved' }
  }
};

function chooseTool(playerId, actionType) {
  const tools = inventoryService.getTools(playerId);
  const preferredOrder = ['stone_pickaxe', 'stone_hatchet', 'starter_stone'];

  for (const toolCode of preferredOrder) {
    if (TOOL_RULES[toolCode]?.[actionType] && tools.some((tool) => tool.item_code === toolCode)) {
      return toolCode;
    }
  }

  throw new Error('Подходящий инструмент не найден');
}

function resolveBarrelLoot(toolCode) {
  const table = getBarrelLootTable();
  const rolls = toolCode === 'starter_stone' ? 1 : 2;
  const rewards = [];

  for (let i = 0; i < rolls; i += 1) {
    const picked = weightedPick(table);
    rewards.push({
      item_code: picked.item_code,
      amount: randomInt(picked.min, picked.max),
      durability: picked.durability || null
    });
  }

  return rewards;
}

function resolveAnimalLoot(toolCode) {
  const animal = weightedPick(getAnimalList());
  const bonusMultiplier = toolCode === 'stone_hatchet' ? 1.35 : 1;
  const drops = [];
  for (const rule of animal.loot) {
    if (rule.chance && Math.random() > rule.chance) continue;
    drops.push({
      item_code: rule.item_code,
      amount: Math.max(1, Math.round(randomInt(rule.min, rule.max) * bonusMultiplier))
    });
  }
  return { animal, drops };
}

function grantRewards(playerId, rewards) {
  for (const reward of rewards) {
    const item = getItem(reward.item_code);
    if (item.type === 'tool') {
      inventoryService.addTool(playerId, reward.item_code, reward.durability ?? item.durability ?? null);
    } else {
      inventoryService.addStackableItem(playerId, reward.item_code, reward.amount);
    }
  }
}

async function performGather(playerId, actionType) {
  const remainingMs = cooldownService.getRemainingMs(playerId, 'gather');
  if (remainingMs > 0) {
    throw new Error(`Действие на перезарядке. Осталось ${Math.ceil(remainingMs / 1000)} сек.`);
  }

  const toolCode = chooseTool(playerId, actionType);
  const rule = TOOL_RULES[toolCode][actionType];
  let rewards;
  let extra = {};

  if (['wood', 'stone', 'sulfur', 'metal'].includes(actionType)) {
    rewards = [{ item_code: actionType, amount: rule.amount }];
  } else if (actionType === 'barrel') {
    rewards = resolveBarrelLoot(toolCode);
  } else if (actionType === 'hunt') {
    const huntResult = resolveAnimalLoot(toolCode);
    rewards = huntResult.drops;
    extra = { animal: huntResult.animal.name };
  } else {
    throw new Error('Unknown gather action');
  }

  grantRewards(playerId, rewards);
  const toolUse = inventoryService.useTool(playerId, toolCode);
  cooldownService.startCooldown(playerId, 'gather');

  const compactRewards = rewards.map((reward) => ({
    item_code: reward.item_code,
    name: getItem(reward.item_code).name,
    amount: reward.amount || 1,
    durability: reward.durability ?? null
  }));

  const payload = {
    actionType,
    toolCode,
    toolName: getItem(toolCode).name,
    rewards: compactRewards,
    toolUse,
    ...extra
  };

  playerService.addLog(playerId, `gather_${actionType}`, JSON.stringify(payload));
  const reward = await rewardService.maybeGrantGatherReward(playerId, { tileType: actionType });

  return {
    ...payload,
    cooldownMs: cooldownService.GATHER_COOLDOWN_MS,
    reward
  };
}

module.exports = {
  performGather
};
