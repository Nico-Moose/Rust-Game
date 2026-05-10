const express = require('express');
const { requireAuth } = require('../middleware/authMiddleware');
const playerService = require('../services/playerService');
const inventoryService = require('../services/inventoryService');
const cooldownService = require('../services/cooldownService');
const gatherService = require('../services/gatherService');

const router = express.Router();

router.get('/state', requireAuth, (req, res) => {
  const player = playerService.getPlayerById(req.user.id);
  inventoryService.seedStarterItems(req.user.id);
  res.json({
    player,
    inventory: inventoryService.getInventory(req.user.id),
    resources: inventoryService.getResourceTotals(req.user.id),
    logs: playerService.getPlayerLogs(req.user.id, 20),
    cooldowns: {
      gatherRemainingMs: cooldownService.getRemainingMs(req.user.id, 'gather')
    }
  });
});

router.post('/gather/:actionType', requireAuth, async (req, res, next) => {
  try {
    const result = await gatherService.performGather(req.user.id, req.params.actionType);
    res.json({
      ok: true,
      result,
      inventory: inventoryService.getInventory(req.user.id),
      resources: inventoryService.getResourceTotals(req.user.id),
      cooldowns: {
        gatherRemainingMs: cooldownService.getRemainingMs(req.user.id, 'gather')
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
