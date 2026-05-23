const targetQueue = [];
import Player from './player.js';
import Ship from './ship.js';

const player1 = new Player('human');
const computer = new Player('computer');
const computerAttacks = [];

function placeShipsRandomly(gameboard){
    const shipSizes=[5,4,3,3,2];

    for(const size of shipSizes){

        let placed = false;

        while(!placed){
            const x=randomCoordinate();
            const y=randomCoordinate();

            const ship = new Ship(size);

            const direction = Math.random() < 0.5 ? 'horizontal' : 'vertical';

            placed = gameboard.placeShip(ship, x, y, direction);
        }
    }
}

placeShipsRandomly(player1.gameboard);
placeShipsRandomly(computer.gameboard);

const playerBoard = document.getElementById('player-board');
const computerBoard = document.getElementById('computer-board');

function randomCoordinate() {

  return Math.floor(Math.random() * 10);

}

function addAdjacentTargets(x,y){
    const directions = [
        [-1,0],
        [1,0],
        [0,-1],
        [0,1],
    ];

    for (const dir of directions){
        const newX = x+dir[0];
        const newY = y+dir[1];

        const alreadyAdded = computerAttacks.some(coord => 
            coord[0]===newX &&
            coord[1]===newY 
        );

        if(
            newX>=0 &&
            newX<10 &&
            newY>=0 &&
            newY<10 &&
            !alreadyAdded
        ){
            targetQueue.push([newX, newY]);
        }
    }
}

function computerTurn() {

    let x;
    let y;
  
    if(targetQueue.length > 0){

        const target = targetQueue.shift();

        x= target[0];
        y= target[1];

    }else {

        let alreadyAttacked = true;

        while (alreadyAttacked) {

            x = randomCoordinate();
            y = randomCoordinate();

            alreadyAttacked = computerAttacks.some(coord =>
            coord[0] === x && coord[1] === y
            );
        }
    }

    computerAttacks.push([x, y]);

    const result = player1.gameboard.recieveAttack(x, y);

    if(result === 'hit'){
        addAdjacentTargets(x,y);
    }
}

function gameAttack(x, y) {

    const alreadyHit =
        computer.gameboard.hitAttacks.some(coord =>
            coord[0] === x && coord[1] === y
        );

    const alreadyMissed =
    computer.gameboard.missedAttacks.some(coord =>
        coord[0] === x && coord[1] === y
    );

    if (alreadyHit || alreadyMissed) {
        return;
    }

    computer.gameboard.recieveAttack(x, y);

    if (computer.gameboard.allShipsSunk()) {

        alert('You Win!');

        return;
    }

    computerTurn();

    if (player1.gameboard.allShipsSunk()) {

    alert('Computer Wins!');

    return;
    }

    renderBoard(playerBoard, player1.gameboard, true);

    renderBoard(computerBoard, computer.gameboard, false);

}

function renderBoard(boardElement, gameboard, showShips = false) {
    boardElement.innerHTML = '';

    for(let x=0; x<10; x++){
        for(let y=0; y<10; y++){

            const cell = document.createElement('div');

            cell.classList.add('cell');

            cell.dataset.x = x;
            cell.dataset.y = y;

            if (boardElement.id === 'computer-board') {

                cell.addEventListener('click', () => {

                    gameAttack(x, y);

                });
            }

            if(showShips){

                for(const obj of gameboard.ships) {
                    for(const coordinate of obj.coordinates){

                        if(
                            coordinate[0]===x &&
                            coordinate[1]===y

                        ){
                            cell.classList.add('ship');
                        }
                    }
                }

                
            }

            for (const miss of gameboard.missedAttacks){
                    
                    if(miss[0]===x && miss[1]===y){
                        cell.classList.add('miss');
                    }
                    
            }

            for(const hit of gameboard.hitAttacks){
                if(hit[0]===x && hit[1]===y){
                    cell.classList.add('hit');
                }
            }

            boardElement.appendChild(cell);
        }
    }

    
}

renderBoard(playerBoard, player1.gameboard, true);

renderBoard(computerBoard, computer.gameboard, false);

