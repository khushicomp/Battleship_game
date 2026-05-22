import GameBoard from "./gameboard";

class Player{
    constructor(type='human'){
        this.type=type;
        this.gameboard= new GameBoard();
    }
}

export default Player;