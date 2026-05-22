import Player from "../src/player.js";

test('creates human player by default', ()=>{
    const player = new Player();

    expect(player.type).toBe('human');
});

test('creates computer player', ()=>{
    const player = new Player('computer');

    expect(player.type).toBe('computer');
});

test('player has a gameboard', ()=>{
    const player = new Player();

    expect(player.gameboard).toBeDefined();
});