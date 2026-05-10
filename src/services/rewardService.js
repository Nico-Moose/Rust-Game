const db = require('../db/database');
const playerService = require('./playerService');
const wizebotService = require('./wizebotService');

function getRewardHistory(playerId, limit = 20) {
  return db.prepare('SELECT * FROM reward_logs WHERE player_id = ? ORDER BY id DESC LIMIT ?').all(playerId, limit);
}

function createRewardLog(playerId, rewardType, rewardAmount, reason) {
  db.prepare(
    'INSERT INTO reward_logs (player_id, reward_type, reward_amount, reason, created_at) VALUES (?, ?, ?, ?, ?)'
  ).run(playerId, rewardType, rewardAmount, reason, new Date().toISOString());
}

async function maybeGrantGatherReward(playerId, gatherResult) {
  const player = playerService.getPlayerById(playerId);
  if (!player) {
    return { granted: false, reason: 'Player not found' };
  }

  if (player.gold_earned_today >= 100) {
    return { granted: false, reason: 'Daily gold cap reached' };
  }

  const roll = Math.random();
  if (roll > 0.12) {
    return { granted: false, reason: 'No reward this time' };
  }

  const amount = gatherResult.tileType === 'scrap' ? 5 : 2;
  playerService.incrementGoldEarnedToday(playerId, amount);
  createRewardLog(playerId, 'wizebot_gold', amount, `Gather reward from ${gatherResult.tileType}`);

  const payout = await wizebotService.queueGoldReward({
    player,
    amount,
    reason: `gather:${gatherResult.tileType}`
  });

  return {
    granted: true,
    amount,
    payout
  };
}

module.exports = {
  getRewardHistory,
  maybeGrantGatherReward
};
