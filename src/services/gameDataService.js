const ITEMS = {
  starter_stone: { code: 'starter_stone', name: 'Камень', type: 'tool', durability: null },
  torch: { code: 'torch', name: 'Факел', type: 'tool', durability: null },
  stone_pickaxe: { code: 'stone_pickaxe', name: 'Каменная кирка', type: 'tool', durability: 10 },
  stone_hatchet: { code: 'stone_hatchet', name: 'Каменный топор', type: 'tool', durability: 10 },
  wood: { code: 'wood', name: 'Дерево', type: 'resource' },
  stone: { code: 'stone', name: 'Камень', type: 'resource' },
  sulfur: { code: 'sulfur', name: 'Сера', type: 'resource' },
  metal: { code: 'metal', name: 'Металл', type: 'resource' },
  scrap: { code: 'scrap', name: 'Scrap', type: 'resource' },
  cloth: { code: 'cloth', name: 'Ткань', type: 'resource' },
  food: { code: 'food', name: 'Еда', type: 'resource' },
  fuel: { code: 'fuel', name: 'Топливо', type: 'resource' },
  rope: { code: 'rope', name: 'Верёвка', type: 'resource' },
  spring: { code: 'spring', name: 'Пружина', type: 'resource' },
  gears: { code: 'gears', name: 'Шестерни', type: 'resource' },
  components: { code: 'components', name: 'Компоненты', type: 'resource' },
  metal_scrap: { code: 'metal_scrap', name: 'Металлолом', type: 'resource' },
  animal_fat: { code: 'animal_fat', name: 'Жир', type: 'resource' }
};

const RECIPES = [
  {
    code: 'stone_pickaxe',
    name: 'Каменная кирка',
    cost: { wood: 100, stone: 100 },
    description: 'Добывает камень, серу, металл, бочки и животных по 40. Не рубит дерево.',
    creates: { item_code: 'stone_pickaxe', durability: 10 }
  },
  {
    code: 'stone_hatchet',
    name: 'Каменный топор',
    cost: { wood: 100, stone: 100 },
    description: 'Добывает дерево, бочки и животных по 40. Не добывает руду.',
    creates: { item_code: 'stone_hatchet', durability: 10 }
  }
];

const ANIMALS = [
  { code: 'boar', name: 'Кабан', weight: 24, loot: [{ item_code: 'food', min: 25, max: 40 }, { item_code: 'cloth', min: 10, max: 18 }, { item_code: 'animal_fat', min: 1, max: 3, chance: 0.45 }] },
  { code: 'bear', name: 'Медведь', weight: 10, loot: [{ item_code: 'food', min: 40, max: 70 }, { item_code: 'cloth', min: 18, max: 28 }, { item_code: 'animal_fat', min: 2, max: 5, chance: 0.7 }, { item_code: 'scrap', min: 5, max: 12, chance: 0.2 }] },
  { code: 'wolf', name: 'Волк', weight: 18, loot: [{ item_code: 'food', min: 20, max: 35 }, { item_code: 'cloth', min: 8, max: 16 }, { item_code: 'animal_fat', min: 1, max: 2, chance: 0.35 }] },
  { code: 'deer', name: 'Олень', weight: 28, loot: [{ item_code: 'food', min: 18, max: 32 }, { item_code: 'cloth', min: 8, max: 15 }] },
  { code: 'chicken', name: 'Курица', weight: 20, loot: [{ item_code: 'food', min: 6, max: 14 }, { item_code: 'cloth', min: 2, max: 6 }] }
];

const BARREL_LOOT = [
  { item_code: 'scrap', min: 10, max: 25, weight: 24 },
  { item_code: 'cloth', min: 10, max: 25, weight: 16 },
  { item_code: 'metal', min: 10, max: 25, weight: 14 },
  { item_code: 'sulfur', min: 10, max: 25, weight: 14 },
  { item_code: 'food', min: 10, max: 20, weight: 10 },
  { item_code: 'fuel', min: 10, max: 20, weight: 8 },
  { item_code: 'components', min: 1, max: 3, weight: 8 },
  { item_code: 'rope', min: 1, max: 2, weight: 5 },
  { item_code: 'spring', min: 1, max: 2, weight: 4 },
  { item_code: 'gears', min: 1, max: 2, weight: 4 },
  { item_code: 'metal_scrap', min: 5, max: 15, weight: 8 },
  { item_code: 'stone_pickaxe', min: 1, max: 1, weight: 1, durability: 6 },
  { item_code: 'stone_hatchet', min: 1, max: 1, weight: 1, durability: 6 }
];

function getItem(code) {
  return ITEMS[code] || { code, name: code, type: 'resource' };
}

function getRecipes() {
  return RECIPES;
}

function getAnimalList() {
  return ANIMALS;
}

function getBarrelLootTable() {
  return BARREL_LOOT;
}

module.exports = {
  ITEMS,
  getItem,
  getRecipes,
  getAnimalList,
  getBarrelLootTable
};
