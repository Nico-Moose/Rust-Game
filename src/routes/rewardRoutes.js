const express = require('express');
const { requireAuth } = require('../middleware/authMiddleware');
const rewardService = require('../services/rewardService');

const router = express.Router();

router.get('/history', requireAuth, (req, res) => {
  const rewards = rewardService.getRewardHistory(req.user.id, 20);
  res.json({ rewards });
});

module.exports = router;
