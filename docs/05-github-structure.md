# Suggested GitHub Structure

## Repository root
```text
moose-rust-wasteland/
  README.md
  .gitignore
  package.json
  .env.example
  server.js
  /docs
    00-project-vision.md
    01-game-design-document.md
    02-core-systems.md
    03-progression-and-balance.md
    04-stage-1-development-plan.md
    05-github-structure.md
  /src
    /config
    /db
    /routes
    /services
    /middleware
    /models
    /utils
  /public
    index.html
    game.html
    style.css
    app.js
```

## Suggested `/src/routes`
- `authRoutes.js`
- `playerRoutes.js`
- `inventoryRoutes.js`
- `craftRoutes.js`
- `buildRoutes.js`
- `combatRoutes.js`
- `mapRoutes.js`
- `rewardRoutes.js`

## Suggested `/src/services`
- `twitchAuthService.js`
- `playerService.js`
- `inventoryService.js`
- `craftService.js`
- `buildService.js`
- `lootService.js`
- `combatService.js`
- `mapService.js`
- `scrapService.js`
- `wizebotService.js`

## Suggested initial GitHub issues
1. Set up Node.js server and project skeleton
2. Add Twitch OAuth login
3. Create player persistence schema
4. Build starter tile map
5. Implement resource gathering
6. Implement inventory API
7. Implement crafting tier 1
8. Implement starter building pieces
9. Add death and dropped loot
10. Add scrap and first monument containers
11. Add WizeBot reward logs and hooks
12. Build first UI panels and HUD

## Suggested branches
- `main` — stable branch
- `dev` — active integration
- `feature/twitch-auth`
- `feature/map-and-gathering`
- `feature/crafting-tier1`
- `feature/base-building`
- `feature/combat-and-death`
- `feature/wizebot-hooks`

## Suggested `.env.example`
```env
PORT=3000
SESSION_SECRET=change_me
TWITCH_CLIENT_ID=your_twitch_client_id
TWITCH_CLIENT_SECRET=your_twitch_client_secret
TWITCH_CALLBACK_URL=https://your-domain.com/auth/twitch/callback
WIZEBOT_API_KEY=your_wizebot_api_key
WIZEBOT_CHANNEL=your_channel_name
```
