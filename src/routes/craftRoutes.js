const express = require('express');
const { requireAuth } = require('../middleware/authMiddleware');
const craftService = require('../services/craftService');
const inventoryService = require('../services/inventoryService');

const router = express.Router();

router.get('/recipes', requireAuth, (req, res) => {
  res.json({ recipes: craftService.getRecipesForPlayer(req.user.id) });
});

router.post('/make', requireAuth, (req, res, next) => {
  try {
    const { recipeCode } = req.body;
    const crafted = craftService.craft(req.user.id, recipeCode);
    res.json({
      ok: true,
      crafted,
      recipes: craftService.getRecipesForPlayer(req.user.id),
      inventory: inventoryService.getInventory(req.user.id),
      resources: inventoryService.getResourceTotals(req.user.id)
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
