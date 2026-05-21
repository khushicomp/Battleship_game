import Ship from '../src/ship';

test('ship length is correct', ()=>{
    const ship=new Ship(3);

    expect(ship.length).toBe(3);
});

test('ship gets hit', ()=>{
    const ship = new Ship(3);
    ship.hit();

    expect(ship.hits).toBe(1);
});

test('ship sinks correctly', ()=>{
    const ship= new Ship(2);

    ship.hit();
    ship.hit();

    expect(ship.isSunk()).toBe(true);
});