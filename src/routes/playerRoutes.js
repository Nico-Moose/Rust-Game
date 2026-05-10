const express = require('express');
const { requireAuth } = require('../middleware/authMiddleware');
const playerService = require('../services/playerService');
const inventoryService = require('../services/inventoryService');
const mapService = require('../services/mapService');
const resourceService = require('../services/resourceService');
const rewardService = require('../services/rewardService');

const router = express.Router();

router.get('/profile', requireAuth, (req, res) => {
  const player = playerService.getPlayerById(req.user.id);
  res.json({ player });
});

router.get('/inventory', requireAuth, (req, res) => {
  const inventory = inventoryService.getInventory(req.user.id);
  res.json({ inventory });
});

router.get('/logs', requireAuth, (req, res) => {
  const logs = playerService.getPlayerLogs(req.user.id, 20);
  res.json({ logs });
});

router.post('/move', requireAuth, (req, res) => {
  const { direction } = req.body;
  const moved = playerService.movePlayer(req.user.id, direction);
  res.json({ ok: true, player: moved });
});

router.post('/gather', requireAuth, async (req, res) => {
  const player = playerService.getPlayerById(req.user.id);
  const tile = mapService.getTileAt(player.x, player.y);
  const gatherResult = resourceService.gatherFromTile(player, tile);

  inventoryService.addItem(player.id, gatherResult.itemCode, gatherResult.amount);
  playerService.addLog(player.id, 'gather', JSON.stringify(gatherResult));

  const reward = await rewardService.maybeGrantGatherReward(player.id, gatherResult);

  res.json({
    ok: true,
    tile,
    gatherResult,
    reward,
    inventory: inventoryService.getInventory(player.id)
  });
});

module.exports = router;
