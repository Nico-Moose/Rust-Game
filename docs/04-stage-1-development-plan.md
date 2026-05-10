# Stage 1 Development Plan

## Stage 1 goal
Build a fully playable foundation, not a fake prototype.

The first playable version should already support:
- Twitch login
- player profile creation
- compact world map
- resource gathering
- basic inventory
- basic crafting
- starter base placement
- storage
- simple scrap progression
- one safe hub and a few dangerous loot zones
- death with dropped loot
- lightweight WizeBot-connected reward hooks

## Stage 1 feature set

### 1. Authentication
- Twitch OAuth login
- persistent session
- player profile linked to Twitch ID

### 2. Core player profile
Store:
- Twitch identity
- display name and avatar
- health
- hunger
- position
- inventory references
- home/base reference
- tech progress state
- season stats

### 3. Map
Recommended for Stage 1:
- top-down grid or tile map
- dense, compact layout
- visible player position
- low-risk start areas
- one safe hub
- 2–3 loot/gather zones

### 4. Gathering
Initial gatherables:
- wood
- stone
- metal ore
- cloth
- food

### 5. Inventory
- stackable resources
- equipped weapon/tool slots
- quick deposit to storage
- simple weight or slot limit only if it improves decisions

### 6. Crafting
Stage 1 craft list:
- stone hatchet
- stone pickaxe
- spear
- bow
- arrows
- bandages
- wooden door
- box
- cupboard/core
- workbench tier 1

### 7. Base building
Minimal but real:
- 1 foundation type
- wall
- doorway
- door
- box
- cupboard/core
- repair and upgrade to stone as a follow-up stage if possible

### 8. Loot zones
Suggested Stage 1 world points:
- Safe Hub
- Scrapyard
- Mine
- Harbor or Checkpoint

### 9. PvP
- player damage
- simple melee and primitive ranged combat
- death drops carried loot
- respawn at shelter/home if available

### 10. Scrap progression
- scrap drops from monuments and containers
- first research path or basic unlock menu
- workbench tier 1 tech branch

### 11. WizeBot hooks
Not full economic integration yet.
Only support:
- daily login rewards
- event/leaderboard payout hooks
- tracking reward eligibility
- safe server-side logs

## Recommended technical architecture
### Backend
- Node.js
- Express
- SQLite for initial persistence
- session-based auth or token-backed session

### Frontend
- browser UI with vanilla JS or a very light frontend framework
- top-down map rendering
- inventory/build/craft panels

### Services
- auth service
- player service
- inventory service
- map service
- crafting service
- building service
- combat service
- loot service
- reward/WizeBot service

## Definition of done for Stage 1
A new player can:
1. log in with Twitch
2. enter the world
3. gather resources
4. craft primitive items
5. build a tiny base
6. store loot
7. visit a danger zone
8. come back with scrap and components
9. die and lose carried items if they fail
10. feel the game loop clearly enough to want Stage 2
