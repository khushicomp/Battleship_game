import Player from "./player.js";
import Ship from "./ship.js";

const player1 = new Player('human');
const computer = new Player('computer');

player1.gameboard.placeShip(new Ship(3), 0, 0);
computer.gameboard.placeShip(new Ship(3), 2, 2);

let currentPlayer = player1;

function playTurn(x,y) {
    if(currentPlayer === player1){
        const result = computer.gameboard.recieveAttack(x,y);
        if (computer.gameboard.allShipsSunk()) {
            console.log('Human wins!');
        }

        console.log(result);

        currentPlayer=computer;
    }else{
        const result = player1.gameboard.recieveAttack(x,y);
        if (player1.gameboard.allShipsSunk()) {
            console.log('Computer wins!');
        }   

        console.log(result);

        currentPlayer=player1;
    }
}

playTurn(2, 2);
playTurn(0, 0);