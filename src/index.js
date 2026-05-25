import Player from './player.js';
import Ship from './ship.js';
import {
    showModeScreen, startModeUI, showGameOver,
    setPlacementDoneUI, setContinueBtnVisible, setDirectionBtn,
    updateLabels, updateStatus,
    renderShipDock, renderBoards,
    continueBtn, directionBtn, pvpBtn, pvcBtn, restartBtn,
} from './dom.js';

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
    setDirectionBtn('horizontal');
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
    setDirectionBtn(dir);
}

// --- Rendering ---

function doRenderBoards() {
    renderBoards(currentPlayer, currentEnemy, gamePhase, {
        onAttack: gameAttack,
        onDrop: (x, y, gameboard) => {
            if (gamePhase !== 'placement' || !draggedShipLength) return;
            const ship = new Ship(draggedShipLength);
            const placed = gameboard.placeShip(ship, x, y, currentDirection);
            if (placed) {
                const currentShips = getCurrentShipArray();
                const index = currentShips.indexOf(draggedShipLength);
                if (index > -1) currentShips.splice(index, 1);
                draggedShipLength = null;
                doRenderShipDock();
                doRenderBoards();
                if (currentShips.length === 0) onAllShipsPlaced();
            }
        },
    });
}

function doRenderShipDock() {
    renderShipDock(getCurrentShipArray(), {
        onDragStart: (size) => { draggedShipLength = size; },
        onDragEnd: () => { draggedShipLength = null; },
    });
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
    if (result === 'hit') addAdjacentTargets(x, y);
}

// --- Game Logic ---

function startMode(mode) {
    gameMode = mode;
    gamePhase = 'placement';
    startModeUI();
    updateLabels(gameMode, currentPlayer, player1);
    updateStatus(gamePhase, gameMode, currentPlayer, player1);
    doRenderBoards();
    doRenderShipDock();
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
        gamePhase = 'gameover';
        showGameOver(winner);
        doRenderBoards();
        return;
    }

    if (gameMode === 'pvc') {
        computerTurn();
        if (player1.gameboard.allShipsSunk()) {
            gamePhase = 'gameover';
            showGameOver('Computer');
            doRenderBoards();
            return;
        }
        doRenderBoards();
    } else {
        doRenderBoards();
        const next = currentPlayer === player1 ? 'Player 2' : 'Player 1';
        updateStatus(gamePhase, gameMode, currentPlayer, player1, `Pass device to ${next}, then click Continue`);
        setContinueBtnVisible(true);
    }
}

function onAllShipsPlaced() {
    if (gameMode === 'pvc') {
        player1Ready = true;
        placeShipsRandomly(player2.gameboard);
        player2Ready = true;
        gamePhase = 'battle';
        setPlacementDoneUI();
        updateStatus(gamePhase, gameMode, currentPlayer, player1);
        doRenderBoards();
    } else {
        if (currentPlayer === player1) {
            player1Ready = true;
            updateStatus(gamePhase, gameMode, currentPlayer, player1, 'Player 1 ready! Pass device to Player 2, then click Continue');
            setContinueBtnVisible(true);
        } else {
            player2Ready = true;
            gamePhase = 'battle';
            setPlacementDoneUI();
            updateStatus(gamePhase, gameMode, currentPlayer, player1, 'All ships placed! Pass device to Player 1, then click Continue to begin');
            setContinueBtnVisible(true);
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
    setContinueBtnVisible(false);

    if (currentPlayer === player1) {
        currentPlayer = player2;
        currentEnemy = player1;
    } else {
        currentPlayer = player1;
        currentEnemy = player2;
    }

    updateLabels(gameMode, currentPlayer, player1);
    updateStatus(gamePhase, gameMode, currentPlayer, player1);

    if (gamePhase === 'placement') {
        doRenderShipDock();
    }
    doRenderBoards();
});

pvpBtn.addEventListener('click', () => startMode('pvp'));
pvcBtn.addEventListener('click', () => startMode('pvc'));

restartBtn.addEventListener('click', () => {
    init();
    showModeScreen();
});

// --- Boot ---
init();
showModeScreen();
