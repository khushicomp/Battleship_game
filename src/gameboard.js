class GameBoard {
    constructor(){
        this.ships=[];
        this.missedAttacks=[];
    }

    placeShip(ship, x, y){
        const coordinates=[];

        for(let i=0; i<ship.length; i++){
            coordinates.push([x, y+i]);
        }

        this.ships.push({
            ship,
            coordinates,
        });
    }

    recieveAttack(x,y){
        for(const obj of this.ships){
            for(const coordinate of obj.coordinates){

                if(coordinate[0]===x && coordinate[1]===y){
                    obj.ship.hit();
                    return 'hit';
                }
            }
        }

        this.missedAttacks.push([x,y]);
        return 'miss';
    }

    allShipsSunk(){
        return this.ships.every(obj=> obj.ship.isSunk());
    }
}

export default GameBoard;