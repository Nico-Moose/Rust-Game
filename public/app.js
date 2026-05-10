let gameState = null;
let cooldownInterval = null;

async function request(url, options = {}) {
  const response = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options
  });

  const json = await response.json().catch(() => ({ error: 'Request failed' }));
  if (!response.ok) {
    throw new Error(json.error || 'Request failed');
  }
  return json;
}

function formatDuration(ms) {
  if (!ms || ms <= 0) return 'Готово';
  const totalSeconds = Math.ceil(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function showMessage(message) {
  document.getElementById('game-message').textContent = message;
}

function renderProfile(player) {
  document.getElementById('player-profile').innerHTML = `
    <div class="list">
      <div class="list-item"><strong>${player.display_name}</strong> @${player.login}</div>
      <div class="stat-grid single-col">
        <div class="stat">HP: ${player.hp}</div>
        <div class="stat">Голод: ${player.hunger}</div>
        <div class="stat">Энергия: ${player.energy}</div>
      </div>
    </div>
  `;
}

function renderResources(resources = {}) {
  const entries = Object.entries(resources);
  const el = document.getElementById('resource-pills');
  if (!entries.length) {
    el.innerHTML = '<div class="pill">Ресурсов пока нет</div>';
    return;
  }
  el.innerHTML = entries
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([key, value]) => `<div class="pill">${key}: <strong>${value}</strong></div>`)
    .join('');
}

function renderInventory(items) {
  const el = document.getElementById('inventory-list');
  if (!items.length) {
    el.innerHTML = '<div class="list-item">Инвентарь пуст</div>';
    return;
  }
  el.innerHTML = `<div class="list">${items.map((item) => `
    <div class="list-item">
      <strong>${item.name}</strong>
      <div class="muted small">${item.item_code}</div>
      <div>${item.type === 'tool' ? `Прочность: ${item.durability === null ? '∞' : item.durability}` : `Количество: ${item.quantity}`}</div>
    </div>`).join('')}</div>`;
}

function renderLogs(logs) {
  const el = document.getElementById('logs-list');
  if (!logs.length) {
    el.innerHTML = '<div class="list-item">Логов пока нет</div>';
    return;
  }
  el.innerHTML = `<div class="list">${logs.map((log) => `
    <div class="list-item">
      <strong>${log.action_type}</strong>
      <div class="muted small">${new Date(log.created_at).toLocaleString('ru-RU')}</div>
    </div>`).join('')}</div>`;
}

function renderRecipes(recipes) {
  const el = document.getElementById('craft-list');
  if (!recipes.length) {
    el.innerHTML = '<div class="list-item">Рецептов пока нет</div>';
    return;
  }
  el.innerHTML = recipes.map((recipe) => {
    const missing = Object.entries(recipe.missing || {});
    const missingHtml = missing.length
      ? `<div class="muted small">Не хватает: ${missing.map(([key, value]) => `${key} ${value}`).join(', ')}</div>`
      : '<div class="good small">Ресурсов хватает</div>';
    return `
      <div class="recipe-card">
        <div>
          <strong>${recipe.name}</strong>
          <div class="muted small">${recipe.description}</div>
          <div class="small">Цена: wood 100, stone 100</div>
          ${missingHtml}
        </div>
        <button class="btn ${recipe.canCraft ? 'primary' : ''}" ${recipe.canCraft ? '' : 'disabled'} data-craft="${recipe.code}">Скрафтить</button>
      </div>`;
  }).join('');

  document.querySelectorAll('[data-craft]').forEach((button) => {
    button.addEventListener('click', () => craft(button.dataset.craft));
  });
}

function renderLastResult(result) {
  const el = document.getElementById('last-result');
  if (!result) {
    el.textContent = 'Пока пусто';
    return;
  }
  const rewards = result.rewards.map((reward) => `${reward.name} x${reward.amount}`).join(', ');
  let html = `<div class="list-item"><strong>${result.toolName}</strong><div class="small">Добыча: ${rewards || 'ничего'}</div>`;
  if (result.animal) html += `<div class="small">Животное: ${result.animal}</div>`;
  if (result.toolUse) {
    html += `<div class="small">Прочность: ${result.toolUse.remainingDurability === null ? '∞' : result.toolUse.remainingDurability}</div>`;
    if (result.toolUse.broken) html += `<div class="danger-text small">Инструмент сломался</div>`;
  }
  if (result.reward?.granted) html += `<div class="good small">WizeBot gold +${result.reward.amount}</div>`;
  html += '</div>';
  el.innerHTML = html;
}

function setCooldown(ms) {
  const timerEl = document.getElementById('cooldown-timer');
  let remaining = ms || 0;
  timerEl.textContent = formatDuration(remaining);

  if (cooldownInterval) clearInterval(cooldownInterval);
  cooldownInterval = setInterval(() => {
    remaining = Math.max(0, remaining - 1000);
    timerEl.textContent = formatDuration(remaining);
    if (remaining <= 0) {
      clearInterval(cooldownInterval);
      cooldownInterval = null;
    }
  }, 1000);
}

async function loadGame() {
  const auth = await request('/auth/me');
  if (!auth.authenticated) {
    window.location.href = '/';
    return;
  }

  const [state, recipes] = await Promise.all([
    request('/api/player/state'),
    request('/api/craft/recipes')
  ]);

  gameState = { ...state, recipes: recipes.recipes };
  renderProfile(state.player);
  renderResources(state.resources);
  renderInventory(state.inventory);
  renderLogs(state.logs);
  renderRecipes(recipes.recipes);
  setCooldown(state.cooldowns.gatherRemainingMs);
}

async function gather(actionType) {
  const data = await request(`/api/player/gather/${actionType}`, { method: 'POST' });
  renderResources(data.resources);
  renderInventory(data.inventory);
  renderLastResult(data.result);
  showMessage(`Действие выполнено: ${actionType}`);
  setCooldown(data.cooldowns.gatherRemainingMs);
  const state = await request('/api/player/state');
  renderLogs(state.logs);
}

async function craft(recipeCode) {
  const data = await request('/api/craft/make', {
    method: 'POST',
    body: JSON.stringify({ recipeCode })
  });
  renderResources(data.resources);
  renderInventory(data.inventory);
  renderRecipes(data.recipes);
  renderLastResult({ toolName: 'Крафт', rewards: [{ name: data.crafted.name, amount: 1 }] });
  showMessage(`Скрафчено: ${data.crafted.name}`);
  const state = await request('/api/player/state');
  renderLogs(state.logs);
}

function initTabs() {
  document.querySelectorAll('.tab-btn').forEach((button) => {
    button.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach((btn) => btn.classList.remove('active', 'primary'));
      document.querySelectorAll('.tab-panel').forEach((panel) => panel.classList.remove('active'));
      button.classList.add('active', 'primary');
      document.querySelector(`[data-panel="${button.dataset.tab}"]`).classList.add('active');
    });
  });
}

window.addEventListener('DOMContentLoaded', () => {
  initTabs();
  loadGame().catch((error) => showMessage(error.message));

  document.querySelectorAll('[data-gather]').forEach((button) => {
    button.addEventListener('click', () => gather(button.dataset.gather).catch((error) => showMessage(error.message)));
  });

  document.getElementById('refresh-btn').addEventListener('click', () => loadGame().catch((error) => showMessage(error.message)));
  document.getElementById('logout-btn').addEventListener('click', async () => {
    await request('/auth/logout', { method: 'POST' });
    window.location.href = '/';
  });
});
