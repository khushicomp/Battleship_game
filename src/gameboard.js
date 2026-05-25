class GameBoard {
    constructor(){
        this.ships=[];
        this.missedAttacks=[];
        this.hitAttacks=[];
    }

    placeShip(ship, x, y, direction = 'horizontal'){
        const coordinates=[];

        for(let i=0; i<ship.length; i++){
            
            if(direction === 'horizontal'){
                coordinates.push([x, y+i]);
            }else{
                coordinates.push([x+i, y]);
            }
        }

        if(!this.isValidPlacement(coordinates)){
            return false;
        }

        this.ships.push({
            ship,
            coordinates,
        });

        return true;
    }

    receiveAttack(x,y){
        for(const obj of this.ships){
            for(const coordinate of obj.coordinates){

                if(coordinate[0]===x && coordinate[1]===y){
                    obj.ship.hit();

                    this.hitAttacks.push([x,y]);
                    
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

    isValidPlacement(coordinates){
        for(const coordinate of coordinates){

            const x = coordinate[0];
            const y = coordinate[1];

            if(x<0 || x>=10 || y<0 || y>=10){
                return false;
            }

            for(const obj of this.ships){
                for(const existing of obj.coordinates){
                    if(existing[0]===x && existing[1]===y){
                        return false;
                    }
                }
            }
        }

        return true;
    }
}

export default GameBoard;