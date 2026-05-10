const express = require('express');
const { requireAuth } = require('../middleware/authMiddleware');
const mapService = require('../services/mapService');
const playerService = require('../services/playerService');

const router = express.Router();

router.get('/', requireAuth, (req, res) => {
  const player = playerService.getPlayerById(req.user.id);
  const map = mapService.getVisibleMap(player.x, player.y, 4);
  res.json({ map, playerPosition: { x: player.x, y: player.y } });
});

module.exports = router;
