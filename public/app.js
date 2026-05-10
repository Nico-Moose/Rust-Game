async function request(url, options = {}) {
  const response = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || 'Request failed');
  }

  return response.json();
}

function renderProfile(player) {
  const profileEl = document.getElementById('player-profile');
  profileEl.innerHTML = `
    <div class="list">
      <div class="list-item"><strong>${player.display_name}</strong> @${player.login}</div>
      <div class="stat-grid">
        <div class="stat">HP: ${player.hp}</div>
        <div class="stat">Голод: ${player.hunger}</div>
        <div class="stat">Энергия: ${player.energy}</div>
        <div class="stat">Scrap: ${player.scrap}</div>
        <div class="stat">X: ${player.x}</div>
        <div class="stat">Y: ${player.y}</div>
      </div>
    </div>
  `;
}

function renderInventory(items) {
  const el = document.getElementById('inventory-list');
  if (!items.length) {
    el.innerHTML = '<div class="list-item">Инвентарь пуст</div>';
    return;
  }
  el.innerHTML = `<div class="list">${items
    .map((item) => `<div class="list-item">${item.item_code}: <strong>${item.quantity}</strong></div>`)
    .join('')}</div>`;
}

function renderLogs(logs) {
  const el = document.getElementById('logs-list');
  if (!logs.length) {
    el.innerHTML = '<div class="list-item">Логов пока нет</div>';
    return;
  }
  el.innerHTML = `<div class="list">${logs
    .map((log) => `<div class="list-item"><strong>${log.action_type}</strong><br>${log.created_at}</div>`)
    .join('')}</div>`;
}

function renderMap(map, playerPosition) {
  const el = document.getElementById('map-grid');
  const rows = [];
  map.forEach((row) => {
    row.forEach((tile) => {
      const isPlayer = tile.x === playerPosition.x && tile.y === playerPosition.y;
      rows.push(`<div class="tile ${tile.type} ${isPlayer ? 'player' : ''}">${isPlayer ? 'YOU' : tile.type}</div>`);
    });
  });
  el.innerHTML = rows.join('');
}

function showMessage(message) {
  document.getElementById('game-message').textContent = message;
}

async function loadGame() {
  const auth = await request('/auth/me');
  if (!auth.authenticated) {
    window.location.href = '/';
    return;
  }

  const [profile, inventory, logs, map] = await Promise.all([
    request('/api/player/profile'),
    request('/api/player/inventory'),
    request('/api/player/logs'),
    request('/api/map')
  ]);

  renderProfile(profile.player);
  renderInventory(inventory.inventory);
  renderLogs(logs.logs);
  renderMap(map.map, map.playerPosition);
}

async function move(direction) {
  await request('/api/player/move', {
    method: 'POST',
    body: JSON.stringify({ direction })
  });
  showMessage(`Игрок перемещён: ${direction}`);
  await loadGame();
}

async function gather() {
  const result = await request('/api/player/gather', {
    method: 'POST',
    body: JSON.stringify({})
  });

  let message = `Добыто: ${result.gatherResult.itemCode} x${result.gatherResult.amount}`;
  if (result.reward?.granted) {
    message += ` | Бонус WizeBot gold: +${result.reward.amount}`;
  }
  showMessage(message);
  await loadGame();
}

window.addEventListener('DOMContentLoaded', () => {
  loadGame().catch((error) => {
    showMessage(error.message);
  });

  document.querySelectorAll('[data-move]').forEach((button) => {
    button.addEventListener('click', () => move(button.dataset.move).catch((error) => showMessage(error.message)));
  });

  document.getElementById('gather-btn').addEventListener('click', () => gather().catch((error) => showMessage(error.message)));
  document.getElementById('refresh-btn').addEventListener('click', () => loadGame().catch((error) => showMessage(error.message)));
  document.getElementById('logout-btn').addEventListener('click', async () => {
    await request('/auth/logout', { method: 'POST' });
    window.location.href = '/';
  });
});
