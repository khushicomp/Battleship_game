import GameBoard from "../src/gameboard";
import Ship from "../src/ship";

test('places ship correctly', ()=>{
    const board = new GameBoard();
    const ship = new Ship(3);

    board.placeShip(ship, 0, 0);

    expect(board.ships.length).toBe(1);
  
});

test('receives a hit attack', ()=> {
    const board = new GameBoard();
    const ship = new Ship(3);

    board.placeShip(ship, 0, 0);

    board.recieveAttack(0,1);

    expect(ship.hits).toBe(1);
});

test('records missec attacks', ()=>{
    const board = new GameBoard();
    const ship = new Ship(3);
    board.placeShip(ship, 0, 0);

    board.recieveAttack(5,5);

    expect(board.missedAttacks.length).toBe(1);
});

test('reports all ships sunk', ()=>{
    const board = new GameBoard();

    const ship1 = new Ship(2);
    const ship2 = new Ship(3);

    board.placeShip(ship1, 0, 0);
    board.placeShip(ship2, 2, 2);

    ship1.hit();
    ship1.hit();

    ship2.hit();
    ship2.hit();
    ship2.hit();

    expect(board.allShipsSunk()).toBe(true);
});

test('reports not all ships sunk', () => {
  const board = new GameBoard();

  const ship = new Ship(3);

  board.placeShip(ship, 0, 0);

  ship.hit();

  expect(board.allShipsSunk()).toBe(false);
});

