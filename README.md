# Battleship

A browser-based Battleship game built with vanilla JavaScript. Supports Player vs Computer and Player vs Player modes on a single device.

## Features

- **Two game modes**: Player vs Computer (PvC) or Player vs Player (PvP, pass-and-play)
- **Drag-and-drop ship placement** with toggleable horizontal/vertical orientation (`R` key or button)
- **Computer AI** with hunt/target logic — after a hit, it attacks adjacent cells before reverting to random shots
- **Five ships**: Carrier (5), Battleship (4), Cruiser (3), Submarine (3), Destroyer (2)

## Getting Started

Open `index.html` directly in a browser (no build step required). The game runs as ES modules.

```bash
# Optional: serve with a local server to avoid CORS issues with ES modules
npx serve .
```

## Project Structure

```
src/
  ship.js        # Ship class — tracks hits and sunk state
  gameboard.js   # 10×10 board — ship placement, attack handling
  player.js      # Player class wrapping a gameboard
  dom.js         # All DOM rendering and UI helpers
  index.js       # Game state, logic, and event wiring
index.html
style.css
test/
  ship.test.js
  gameboard.test.js
  player.test.js
```

## Running Tests

```bash
npm install
npm test
```

Tests use Jest with Babel for ES module support.

## How to Play

1. Select a game mode on the start screen.
2. Drag ships from the dock onto your board. Press `R` or click the direction button to rotate before placing.
3. In PvP mode, pass the device between players when prompted — each player places ships and takes turns attacking without seeing the other's board.
4. Click enemy cells to attack. The game ends when all of one side's ships are sunk.
