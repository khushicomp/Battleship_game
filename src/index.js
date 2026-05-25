import Player from './player.js';
import Ship from './ship.js';

// --- Constants ---
const SHIP_SIZES = [5, 4, 3, 3, 2];

// --- State ---
const targetQueue = [];
const computerAttacks = [];

let gameMode = null;
let gamePhase = 'mode-select';
let player1, player2;
let player1Ships, player2Ships;
let player1Ready, player2Ready;
let draggedShipLength = null;
let currentDirection = 'horizontal';
let currentPlayer, currentEnemy;

// --- DOM ---
const shipDock = document.getElementById('ship-dock');
const playerBoard = document.getElementById('player-board');
const computerBoard = document.getElementById('computer-board');
const statusBar = document.getElementById('status-bar');
const statusText = document.getElementById('status-text');
const continueBtn = document.getElementById('continue-btn');
const directionBtn = document.getElementById('direction-btn');
const modeScreen = document.getElementById('mode-screen');
const pvpBtn = document.getElementById('pvp-btn');
const pvcBtn = document.getElementById('pvc-btn');
const gameOverScreen = document.getElementById('game-over-screen');
const winnerMessage = document.getElementById('winner-message');
const restartBtn = document.getElementById('restart-btn');
const playerLabel = document.getElementById('player-label');
const computerLabel = document.getElementById('computer-label');
const boardsSection = document.getElementById('boards');

// --- Init ---

function init() {
    player1 = new Player('human');
    player2 = new Player('human');
    player1Ships = [...SHIP_SIZES];
    player2Ships = [...SHIP_SIZES];
    player1Ready = false;
    player2Ready = false;
    draggedShipLength = null;
    currentDirection = 'horizontal';
    targetQueue.length = 0;
    computerAttacks.length = 0;
    currentPlayer = player1;
    currentEnemy = player2;
    gamePhase = 'mode-select';
    gameMode = null;
    directionBtn.textContent = 'Direction: Horizontal';
}

function showModeScreen() {
    modeScreen.style.display = 'flex';
    gameOverScreen.style.display = 'none';
    statusBar.style.display = 'none';
    continueBtn.style.display = 'none';
    directionBtn.style.display = 'none';
    boardsSection.style.display = 'none';
    shipDock.style.display = 'none';
}

function startMode(mode) {
    gameMode = mode;
    gamePhase = 'placement';
    modeScreen.style.display = 'none';
    boardsSection.style.display = 'flex';
    shipDock.style.display = 'flex';
    directionBtn.style.display = 'inline-block';
    statusBar.style.display = 'flex';
    updateLabels();
    updateStatus();
    renderBoards();
    renderShipDock();
}

function updateLabels() {
    if (gameMode === 'pvc') {
        playerLabel.textContent = 'Your Board';
        computerLabel.textContent = 'Computer';
    } else {
        const name = currentPlayer === player1 ? 'Player 1' : 'Player 2';
        const enemyName = currentPlayer === player1 ? 'Player 2' : 'Player 1';
        playerLabel.textContent = `${name}'s Board`;
        computerLabel.textContent = `${enemyName}'s Board`;
    }
}

function updateStatus(message) {
    if (message) {
        statusText.textContent = message;
        return;
    }
    if (gamePhase === 'placement') {
        const name = gameMode === 'pvc'
            ? 'Player'
            : (currentPlayer === player1 ? 'Player 1' : 'Player 2');
        statusText.textContent = `${name} — drag ships onto your board`;
    } else if (gamePhase === 'battle') {
        const name = gameMode === 'pvc'
            ? 'Your turn'
            : (currentPlayer === player1 ? 'Player 1\'s turn' : 'Player 2\'s turn');
        statusText.textContent = `${name} — click the enemy board to attack`;
    }
}

// --- Helpers ---

function getCurrentShipArray() {
    return currentPlayer === player1 ? player1Ships : player2Ships;
}

function randomCoordinate() {
    return Math.floor(Math.random() * 10);
}

function placeShipsRandomly(gameboard) {
    for (const size of SHIP_SIZES) {
        let placed = false;
        while (!placed) {
            const x = randomCoordinate();
            const y = randomCoordinate();
            const ship = new Ship(size);
            const direction = Math.random() < 0.5 ? 'horizontal' : 'vertical';
            placed = gameboard.placeShip(ship, x, y, direction);
        }
    }
}

function setDirection(dir) {
    currentDirection = dir;
    directionBtn.textContent = `Direction: ${dir.charAt(0).toUpperCase() + dir.slice(1)}`;
}

// --- Computer AI ---

function addAdjacentTargets(x, y) {
    const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
    for (const [dx, dy] of directions) {
        const nx = x + dx;
        const ny = y + dy;
        const outOfBounds = nx < 0 || nx >= 10 || ny < 0 || ny >= 10;
        const alreadyAttacked = computerAttacks.some(c => c[0] === nx && c[1] === ny);
        const alreadyQueued = targetQueue.some(c => c[0] === nx && c[1] === ny);
        if (!outOfBounds && !alreadyAttacked && !alreadyQueued) {
            targetQueue.push([nx, ny]);
        }
    }
}

function computerTurn() {
    let x, y;
    let foundQueued = false;

    while (targetQueue.length > 0) {
        const [tx, ty] = targetQueue.shift();
        if (!computerAttacks.some(c => c[0] === tx && c[1] === ty)) {
            x = tx;
            y = ty;
            foundQueued = true;
            break;
        }
    }

    if (!foundQueued) {
        let alreadyAttacked = true;
        while (alreadyAttacked) {
            x = randomCoordinate();
            y = randomCoordinate();
            alreadyAttacked = computerAttacks.some(c => c[0] === x && c[1] === y);
        }
    }

    computerAttacks.push([x, y]);
    const result = player1.gameboard.receiveAttack(x, y);
    if (result === 'hit') {
        addAdjacentTargets(x, y);
    }
}

// --- Game Logic ---

function showGameOver(winner) {
    gamePhase = 'gameover';
    winnerMessage.textContent = `${winner} Wins!`;
    shipDock.style.display = 'none';
    directionBtn.style.display = 'none';
    statusBar.style.display = 'none';
    renderBoards();
    gameOverScreen.style.display = 'flex';
}

function gameAttack(x, y) {
    if (gamePhase !== 'battle') return;

    const alreadyHit = currentEnemy.gameboard.hitAttacks.some(c => c[0] === x && c[1] === y);
    const alreadyMissed = currentEnemy.gameboard.missedAttacks.some(c => c[0] === x && c[1] === y);
    if (alreadyHit || alreadyMissed) return;

    currentEnemy.gameboard.receiveAttack(x, y);

    if (currentEnemy.gameboard.allShipsSunk()) {
        const winner = gameMode === 'pvc'
            ? 'Player'
            : (currentPlayer === player1 ? 'Player 1' : 'Player 2');
        showGameOver(winner);
        return;
    }

    if (gameMode === 'pvc') {
        computerTurn();
        if (player1.gameboard.allShipsSunk()) {
            showGameOver('Computer');
            return;
        }
        renderBoards();
    } else {
        renderBoards();
        const next = currentPlayer === player1 ? 'Player 2' : 'Player 1';
        updateStatus(`Pass device to ${next}, then click Continue`);
        continueBtn.style.display = 'inline-block';
    }
}

function onAllShipsPlaced() {
    if (gameMode === 'pvc') {
        player1Ready = true;
        placeShipsRandomly(player2.gameboard);
        player2Ready = true;
        gamePhase = 'battle';
        shipDock.style.display = 'none';
        directionBtn.style.display = 'none';
        updateStatus();
        renderBoards();
    } else {
        if (currentPlayer === player1) {
            player1Ready = true;
            const next = 'Player 2';
            updateStatus(`Player 1 ready! Pass device to ${next}, then click Continue`);
            continueBtn.style.display = 'inline-block';
        } else {
            player2Ready = true;
            gamePhase = 'battle';
            shipDock.style.display = 'none';
            directionBtn.style.display = 'none';
            updateStatus('All ships placed! Pass device to Player 1, then click Continue to begin');
            continueBtn.style.display = 'inline-block';
        }
    }
}

// --- Event Listeners ---

document.addEventListener('keydown', (e) => {
    if (e.key.toLowerCase() === 'r' && gamePhase === 'placement') {
        setDirection(currentDirection === 'horizontal' ? 'vertical' : 'horizontal');
    }
});

directionBtn.addEventListener('click', () => {
    setDirection(currentDirection === 'horizontal' ? 'vertical' : 'horizontal');
});

continueBtn.addEventListener('click', () => {
    continueBtn.style.display = 'none';

    if (gamePhase === 'placement') {
        if (currentPlayer === player1) {
            currentPlayer = player2;
            currentEnemy = player1;
        } else {
            currentPlayer = player1;
            currentEnemy = player2;
        }
        updateLabels();
        updateStatus();
        renderShipDock();
        renderBoards();
    } else if (gamePhase === 'battle') {
        if (currentPlayer === player1) {
            currentPlayer = player2;
            currentEnemy = player1;
        } else {
            currentPlayer = player1;
            currentEnemy = player2;
        }
        updateLabels();
        updateStatus();
        renderBoards();
    }
});

pvcBtn.addEventListener('click', () => startMode('pvc'));
pvpBtn.addEventListener('click', () => startMode('pvp'));

restartBtn.addEventListener('click', () => {
    init();
    showModeScreen();
});

// --- Rendering ---

function renderShipDock() {
    shipDock.innerHTML = '';
    for (const size of getCurrentShipArray()) {
        const shipEl = document.createElement('div');
        shipEl.classList.add('draggable-ship');
        shipEl.draggable = true;
        shipEl.dataset.length = size;

        shipEl.addEventListener('dragstart', () => { draggedShipLength = size; });
        shipEl.addEventListener('dragend', () => { draggedShipLength = null; });

        for (let i = 0; i < size; i++) {
            const piece = document.createElement('div');
            piece.classList.add('ship-piece');
            shipEl.appendChild(piece);
        }
        shipDock.appendChild(shipEl);
    }
}

function renderBoards() {
    renderBoard(playerBoard, currentPlayer.gameboard, true);
    renderBoard(computerBoard, currentEnemy.gameboard, false);
}

function renderBoard(boardElement, gameboard, showShips = false) {
    boardElement.innerHTML = '';
    const revealAll = gamePhase === 'gameover';

    for (let x = 0; x < 10; x++) {
        for (let y = 0; y < 10; y++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.dataset.x = x;
            cell.dataset.y = y;

            cell.addEventListener('dragover', (e) => e.preventDefault());

            if (boardElement.id === 'computer-board') {
                cell.addEventListener('click', () => gameAttack(x, y));
            }

            if (showShips || revealAll) {
                for (const obj of gameboard.ships) {
                    for (const coord of obj.coordinates) {
                        if (coord[0] === x && coord[1] === y) {
                            cell.classList.add('ship');
                        }
                    }
                }
            }

            if (showShips) {
                cell.addEventListener('drop', () => {
                    if (gamePhase !== 'placement' || !draggedShipLength) return;

                    const ship = new Ship(draggedShipLength);
                    const placed = gameboard.placeShip(ship, x, y, currentDirection);

                    if (placed) {
                        const currentShips = getCurrentShipArray();
                        const index = currentShips.indexOf(draggedShipLength);
                        if (index > -1) currentShips.splice(index, 1);
                        draggedShipLength = null;
                        renderShipDock();
                        renderBoards();
                        if (currentShips.length === 0) onAllShipsPlaced();
                    }
                });
            }

            for (const [mx, my] of gameboard.missedAttacks) {
                if (mx === x && my === y) cell.classList.add('miss');
            }

            for (const [hx, hy] of gameboard.hitAttacks) {
                if (hx === x && hy === y) cell.classList.add('hit');
            }

            boardElement.appendChild(cell);
        }
    }
}

// --- Boot ---
init();
showModeScreen();
