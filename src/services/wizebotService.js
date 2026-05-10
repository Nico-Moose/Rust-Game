async function queueGoldReward({ player, amount, reason }) {
  const hasApiKey = Boolean(process.env.WIZEBOT_API_KEY);

  if (!hasApiKey) {
    return {
      queued: false,
      simulated: true,
      message: 'WizeBot API key is missing. Reward logged locally only.',
      player: player.login,
      amount,
      reason
    };
  }

  return {
    queued: true,
    simulated: true,
    message: 'Stub service: connect your real WizeBot endpoint here.',
    player: player.login,
    amount,
    reason
  };
}

module.exports = {
  queueGoldReward
};
