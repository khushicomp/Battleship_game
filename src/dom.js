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

export { continueBtn, directionBtn, pvpBtn, pvcBtn, restartBtn };

export function showModeScreen() {
    modeScreen.style.display = 'flex';
    gameOverScreen.style.display = 'none';
    statusBar.style.display = 'none';
    continueBtn.style.display = 'none';
    directionBtn.style.display = 'none';
    boardsSection.style.display = 'none';
    shipDock.style.display = 'none';
}

export function startModeUI() {
    modeScreen.style.display = 'none';
    boardsSection.style.display = 'flex';
    shipDock.style.display = 'flex';
    directionBtn.style.display = 'inline-block';
    statusBar.style.display = 'flex';
}

export function showGameOver(winner) {
    winnerMessage.textContent = `${winner} Wins!`;
    shipDock.style.display = 'none';
    directionBtn.style.display = 'none';
    statusBar.style.display = 'none';
    gameOverScreen.style.display = 'flex';
}

export function setPlacementDoneUI() {
    shipDock.style.display = 'none';
    directionBtn.style.display = 'none';
}

export function setContinueBtnVisible(visible) {
    continueBtn.style.display = visible ? 'inline-block' : 'none';
}

export function setDirectionBtn(dir) {
    directionBtn.textContent = `Direction: ${dir.charAt(0).toUpperCase() + dir.slice(1)}`;
}

export function updateLabels(gameMode, currentPlayer, player1) {
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

export function updateStatus(gamePhase, gameMode, currentPlayer, player1, message) {
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
            : (currentPlayer === player1 ? "Player 1's turn" : "Player 2's turn");
        statusText.textContent = `${name} — click the enemy board to attack`;
    }
}

export function renderShipDock(ships, { onDragStart, onDragEnd }) {
    shipDock.innerHTML = '';
    for (const size of ships) {
        const shipEl = document.createElement('div');
        shipEl.classList.add('draggable-ship');
        shipEl.draggable = true;
        shipEl.dataset.length = size;
        shipEl.addEventListener('dragstart', () => onDragStart(size));
        shipEl.addEventListener('dragend', onDragEnd);
        for (let i = 0; i < size; i++) {
            const piece = document.createElement('div');
            piece.classList.add('ship-piece');
            shipEl.appendChild(piece);
        }
        shipDock.appendChild(shipEl);
    }
}

export function renderBoards(currentPlayer, currentEnemy, gamePhase, { onAttack, onDrop }) {
    renderBoard(playerBoard, currentPlayer.gameboard, true, gamePhase, null, onDrop);
    renderBoard(computerBoard, currentEnemy.gameboard, false, gamePhase, onAttack, null);
}

function renderBoard(boardElement, gameboard, showShips, gamePhase, onAttack, onDrop) {
    boardElement.innerHTML = '';
    const revealAll = gamePhase === 'gameover';

    for (let x = 0; x < 10; x++) {
        for (let y = 0; y < 10; y++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.dataset.x = x;
            cell.dataset.y = y;

            cell.addEventListener('dragover', (e) => e.preventDefault());

            if (onAttack) {
                cell.addEventListener('click', () => onAttack(x, y));
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

            if (onDrop) {
                cell.addEventListener('drop', () => onDrop(x, y, gameboard));
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
