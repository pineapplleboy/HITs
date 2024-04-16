class PriorityQueue { // https://studyjavascript.blogspot.com/2019/03/javascript.html
    constructor() {
        this.storage = new Array();
    }

    addElem(number, priority = 0) {
        this.storage.push({num: number, prior: priority});
    }

    getElem() {
        this.storage.sort(
            function compare(first, second) {
                return -(second.prior - first.prior);
            }
            );
        
        return this.storage.shift().num;
    }

    isEmpty() {
        return this.storage.length == 0;
    }

    size() {
        return this.storage.length;
    }
}

class cell{

    constructor(x,y){

        this.x = x;
        this.y = y;
        this.ant = 1;

        this.food = 0;
        this.home = false;
        this.wall = false;
        this.homeFeromone = 1;
        this.foodFeromone = 1;
    }
}

export class map{

    constructor(fieldSize, ctx, decreasingFeromone, foodValue){

        this.fieldSize = fieldSize;
        this.field = [fieldSize];
        this.ctx = ctx;
        this.decreasingFeromone = decreasingFeromone;
        this.foodValue = foodValue;
        this.homePoint = [0, 0];

        for(let i = 0; i < fieldSize; ++i){

            this.field[i] = [fieldSize];
            for(let j = 0; j < fieldSize; ++j){
                this.field[i][j] = new cell(i, j);
            }
        }
    }

    setDefault(x, y){

        this.field[x][y].ant = 1;

        this.field[x][y].food = 0;
        this.field[x][y].home = false;
        this.field[x][y].wall = false;
        this.field[x][y].homeFeromone = 1;
        this.field[x][y].foodFeromone = 1;
    }

    setWall(x, y){

        if(this.field[x][y].wall){

            for(let i = 0; i < 10; ++i){
                for(let j = 0; j < 10; ++j){
                    this.setDefault(x + i, y + j);
                }
            }

            this.ctx.fillStyle = 'black';
            this.ctx.fillRect(x * 4 + 40, y * 4 + 40, 4 * 10, 4 * 10);
        }
        
        else{

            for(let i = 0; i < 10; ++i){
                for(let j = 0; j < 10; ++j){

                    this.setDefault(x + i, y + j);
                    this.field[x + i][y + j].wall = true;
                }
            }
            
            //this.ctx.fillStyle = '#012E40';
            const wallImg = new Image();
            wallImg.onload = () => (this.field[x][y].wall) ? this.ctx.drawImage(wallImg, x * 4 + 40, y * 4 + 40) : null;
            wallImg.src = '../img/wall.png';
        }
    }

    setFood(x, y){

        for(let i = 0; i < 5; ++i){
            for(let j = 0; j < 5; ++j){

                this.setDefault(x + i, y + j);
                this.field[x + i][y + j].food = this.foodValue;
            }
        }

        this.ctx.fillStyle = '#F2E3D5';
        this.ctx.fillRect(x * 4 + 40, y * 4 + 40, 4 * 5, 4 * 5);
    }

    setHome(x, y){

        for(let i = 0; i < 10; ++i){
            for(let j = 0; j < 10; ++j){

                this.field[this.homePoint[0] + i][this.homePoint[1] + j].home = false;
            }
        }

        this.ctx.fillStyle = 'black';
        this.ctx.fillRect(this.homePoint[0] * 4 + 40, this.homePoint[1] * 4 + 40, 4 * 10, 4 * 10);

        for(let i = 0; i < 10; ++i){
            for(let j = 0; j < 10; ++j){

                this.setDefault(x + i, y + j);
                this.field[x + i][y + j].home = true;
            }
        }

        this.homePoint = [x, y];
        this.ctx.fillStyle = '#F2E3D5';
        this.ctx.fillRect(x * 4 + 40, y * 4 + 40, 4 * 10, 4 * 10);
    }

    generateMaze() {

        let weightMatrix = new Array();
        let size = this.fieldSize;
        let cellSize = 20;
        for (let i = 0; i < size; i += 10) {
            for (let j = 0; j < size; j += 10) {
                this.setWall(i, j);
            }
        }

        for(let i = 0; i < size + 2; ++i){
            
            const wallImg = new Image();
            wallImg.onload = () => {
                this.ctx.drawImage(wallImg, 0, i * 40);
                this.ctx.drawImage(wallImg, i * 40, 0);
                this.ctx.drawImage(wallImg, size * 4 + 40, i * 40);
                this.ctx.drawImage(wallImg, i * 40, size * 4 + 40);
            }
            wallImg.src = '../img/wall.png';
        }

        for (let i = 0; i < size; i++) {
            let temp = new Array();
            for (let j = 0; j < size; j++) {
                temp.push(Math.floor(Math.random() * 50));
            }
            weightMatrix.push(temp);
        }
        
        let queue = new PriorityQueue();
        let cameFrom = new Map();

        let startMazeCell = 0;

        if (startMazeCell - cellSize * size >= 0) {
            queue.addElem(startMazeCell - cellSize * size, weightMatrix[Math.floor((startMazeCell - cellSize * size) / size)][(startMazeCell - cellSize * size) % size]);
            this.setWall(Math.floor((startMazeCell - cellSize * size) / size), (startMazeCell - cellSize * size) % size);
            cameFrom.set(startMazeCell - cellSize * size, startMazeCell);
        }
        if (startMazeCell + cellSize * size <= size * size - 1) {
            queue.addElem(startMazeCell + cellSize * Number(size), weightMatrix[Math.floor((startMazeCell + cellSize * Number(size)) / size)][(startMazeCell + cellSize * Number(size)) % size]);
            this.setWall(Math.floor((startMazeCell + cellSize * size) / size), (startMazeCell + cellSize * size) % size);
            cameFrom.set(startMazeCell + cellSize * size, startMazeCell);
        }
        if (startMazeCell % size - cellSize >= 0) {
            queue.addElem(startMazeCell - cellSize, weightMatrix[Math.floor((startMazeCell - cellSize) / size)][(startMazeCell - cellSize) % size]);
            this.setWall(Math.floor((startMazeCell - cellSize) / size), (startMazeCell - cellSize) % size);
            cameFrom.set(startMazeCell - cellSize, startMazeCell);
        }
        if (startMazeCell % size + cellSize <= size - 1) {
            queue.addElem(startMazeCell + cellSize, weightMatrix[Math.floor((startMazeCell + cellSize) / size)][(startMazeCell + cellSize) % size]);
            this.setWall(Math.floor((startMazeCell + cellSize) / size), (startMazeCell + cellSize) % size);
            cameFrom.set(startMazeCell + cellSize, startMazeCell);
        }
        
        //for(let k = 0; k < fieldSize; ++k){
        while (queue.size() > 0) {
            let currentCell = queue.getElem();

            console.log(Math.floor(currentCell / size), currentCell % size);

            let cameFromCell = cameFrom.get(currentCell);
            if (this.field[Math.floor((Math.floor(cameFromCell / size) + Math.floor(currentCell / size)) / 2)][Math.floor(cameFromCell % size + currentCell % size) / 2].wall) {
                this.setWall(Math.floor((Math.floor(cameFromCell / size) + Math.floor(currentCell / size)) / 2), Math.floor(cameFromCell % size + currentCell % size) / 2);
            }
            
            if (currentCell - cellSize * size >= 0 && (this.field[Math.floor((currentCell - cellSize * size) / size)][(currentCell - cellSize * size) % size].wall)) {
                queue.addElem(currentCell - cellSize * size, weightMatrix[Math.floor((currentCell - cellSize * size) / size)][(currentCell - cellSize * size) % size]);
                this.setWall(Math.floor((currentCell - cellSize * size) / size), (currentCell - cellSize * size) % size);
                cameFrom.set(currentCell - cellSize * size, currentCell);
            }
            if (currentCell + cellSize * Number(size) <= size * size - 1 && (this.field[Math.floor((currentCell + cellSize * Number(size)) / size)][(currentCell + cellSize * Number(size)) % size].wall)) {
                queue.addElem(currentCell + cellSize * Number(size), weightMatrix[Math.floor((currentCell + cellSize * Number(size)) / size)][(currentCell + cellSize * Number(size)) % size]);
                this.setWall(Math.floor((currentCell + cellSize * Number(size)) / size), (currentCell + cellSize * Number(size)) % size);
                cameFrom.set(currentCell + cellSize * Number(size), currentCell);
            }
            if (currentCell % size - cellSize >= 0 && (this.field[Math.floor((currentCell - cellSize) / size)][(currentCell - cellSize) % size].wall)) {
                queue.addElem(currentCell - cellSize , weightMatrix[Math.floor((currentCell - cellSize) / size)][(currentCell - cellSize) % size]);
                this.setWall(Math.floor((currentCell - cellSize) / size), (currentCell - cellSize) % size);
                cameFrom.set(currentCell - cellSize, currentCell);
            }
            if (currentCell % size + cellSize < size && (this.field[Math.floor((currentCell + cellSize) / size)][(currentCell + cellSize) % size].wall)) {
                queue.addElem(currentCell + cellSize, weightMatrix[Math.floor((currentCell + cellSize) / size)][(currentCell + cellSize) % size]);
                this.setWall(Math.floor((currentCell + cellSize) / size), (currentCell + cellSize) % size);
                cameFrom.set(currentCell + cellSize, currentCell);
            }
        }
    }

    reduceFeromones(){

        for(let i = 0; i < this.fieldSize; ++i){
            for(let j = 0; j < this.fieldSize; ++j){

                if(!this.field[i][j].home && this.field[i][j].food <= 0 && !this.field[i][j].wall) {

                    let pixelData = this.ctx.getImageData(i * 4 + 40, j * 4 + 40, 1, 1).data;

                    pixelData[0] *= this.decreasingFeromone;
                    pixelData[1] *= this.decreasingFeromone;
        
                    this.ctx.fillStyle = 'rgba(' + pixelData[0] + ',' + pixelData[1] + ',' + pixelData[2] + ',' + (pixelData[3] / 255) + ')';
                
                    this.ctx.fillRect(i * 4 + 40, j * 4 + 40, 4, 4);
                    this.field[i][j].homeFeromone = Math.max(1, this.field[i][j].homeFeromone * this.decreasingFeromone);
                    this.field[i][j].foodFeromone = Math.max(1, this.field[i][j].foodFeromone * this.decreasingFeromone);
                }
            }
        }
    }

    clearFeromones(){

        for(let i = 0; i < this.fieldSize; ++i){
            for(let j = 0; j < this.fieldSize; ++j){

                if(!this.field[i][j].wall && !this.field[i][j].home){

                    if(this.field[i][j].food > 0){

                        this.setDefault(i, j);
                        this.field[i][j].food = this.foodValue;

                        this.ctx.fillStyle = '#F2E3D5';
                        this.ctx.fillRect(i * 4 + 40, j * 4 + 40, 4, 4);
                    }
                    else{
                        this.setDefault(i, j);
                    }
                }
            }
        }
    }

    startSimulation(){

        this.generateMaze();

        this.setHome(0, 0);

        let foodPos = [Math.floor(Math.floor(Math.random() * this.fieldSize) / 20) * 20, Math.floor(Math.floor(Math.random() * this.fieldSize) / 20) * 20];
        for(let i = 0; i < 2; ++i){
            for(let j = 0; j < 2; ++j){

                this.setFood(foodPos[0] + i * 5, foodPos[1] + j * 5);
            }
        }
    }
}