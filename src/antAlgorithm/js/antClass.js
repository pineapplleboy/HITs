export class ant{

    constructor(homePoint, fieldSize, field, ctx, foodValue, feromoneCoef, antsInCellCoef, increasingFeromone, foodValueCoef, antStepDist){
        this.rotation = Math.floor(Math.random() * 8);
        this.homePoint = homePoint;
        this.position = [homePoint[0] + Math.floor(Math.random() * 10), homePoint[1] + Math.floor(Math.random() * 10)];
        this.food = false;
        this.feromoneToDrop = 0;
        this.path = [this.position];
        this.fieldSize = fieldSize;
        this.field = field;
        this.ctx = ctx;
        this.foodValue = foodValue;
        this.feromoneCoef = feromoneCoef;
        this.antsInCellCoef = antsInCellCoef;
        this.increasingFeromone = increasingFeromone;
        this.foodValueCoef = foodValueCoef;
        this.antStepDist = antStepDist;
    }

    //Сделать шаг
    move(){

        //Если муравей долго не может найти еду или дом, он умирает,
        //в этот момент из-за невероятно удачного совпадения в доме вырастает новый муравей
        if(this.path.length > Math.floor(Math.random() * 275) + 50 || this.field[this.position[0]][this.position[1]].wall){
            this.position = [this.homePoint[0] + Math.floor(Math.random() * 10), this.homePoint[1] + Math.floor(Math.random() * 10)];
            this.rotation = Math.floor(Math.random() * 8);
            this.food = false;
            this.feromoneToDrop = 0;
            this.path = [this.position];
            return;
        }

        let nextCells = [this.leftCell(), this.forwardCell(), this.rightCell()]; //Три массива клеток по разным направлениям
        let cellsPoints = []; //Все претенденты в поле зрения муравья
        let variant = 0;

        for(let j = 0; j < 3; ++j){
            for(let i = 0; i < nextCells[j].length; ++i){
                cellsPoints.push(this.field[nextCells[j][i].arr[0]][nextCells[j][i].arr[1]]);
            }
        }

        cellsPoints = Array.from(new Set(cellsPoints));
        if(cellsPoints.length !== 0){
                
            let priority = [cellsPoints.length];
            let cellPrior = [cellsPoints.length];

            //Если муравей нашёл еду
            if(this.food){

                for(let i = 0; i < cellsPoints.length; ++i){

                    //Приоритет зависит от: явл-ся ли клетка домом, феромона, количества муравьёв в клетке
                    cellPrior[i] = (cellsPoints[i].home ? 100000 : 1) * cellsPoints[i].foodFeromone ** this.feromoneCoef * (1/cellsPoints[i].ant) ** this.antsInCellCoef;
                }
            }

            //Если муравей ищет еду
            else{

                for(let i = 0; i < cellsPoints.length; ++i){

                    //Приоритет зависит от наличия еды в клетке, количества феромона и количества муравьёв в клетке
                    cellPrior[i] = 10 ** cellsPoints[i].food * cellsPoints[i].homeFeromone ** this.feromoneCoef * (1/cellsPoints[i].ant) ** this.antsInCellCoef;
                }
            }

            //Расчёт вероятности
            let sum = 0;
            for(let prior of cellPrior){

                sum += prior;
            }

            for(let i = 0; i < cellsPoints.length; ++i){

                priority[i] = cellPrior[i] / sum;
            }
                
            let chance = Math.random();

            let prevPriority = 0;

            if(variant === 0){

                for(let i = 0; i < cellsPoints.length; ++i){

                    if(chance < prevPriority + priority[i]){
                        variant = i;
                        break;
                    }
                        
                    prevPriority += priority[i];
                }
            }

            //Поворот муравья в зависимости от выбранной клетки
            if(Math.random() > 0.5 && Math.abs(this.position[0] - cellsPoints[variant].x) < this.antStepDist / 4){
                
                if(this.position[1] - cellsPoints[variant].y > 0){
                    this.rotation = 0;
                }
                else{
                    this.rotation = 4;
                }
            }
            else if(Math.abs(this.position[1] - cellsPoints[variant].y) < this.antStepDist / 4){

                if(this.position[0] - cellsPoints[variant].x > 0){
                    this.rotation = 6;
                }
                else{
                    this.rotation = 2;
                }
            }
            else if(Math.abs(this.position[0] - cellsPoints[variant].x) < this.antStepDist / 4){

                if(this.position[1] - cellsPoints[variant].y > 0){
                    this.rotation = 0;
                }
                else{
                    this.rotation = 4;
                }
            }
            else if(this.position[1] - cellsPoints[variant].y > 0) {

                if(this.position[0] - cellsPoints[variant].x > 0){
                    this.rotation = 7;
                }
                else{
                    this.rotation = 1;
                }
            }
            else{

                if(this.position[0] - cellsPoints[variant].x > 0){
                    this.rotation = 5;
                }
                else{
                    this.rotation = 3;
                }
            }

            let x1 = this.position[0];
            let y1 = this.position[1];
            

            this.field[this.position[0]][this.position[1]].ant = Math.max(1, this.field[this.position[0]][this.position[1]].ant - 1);
            this.position = [cellsPoints[variant].x, cellsPoints[variant].y];

            this.field[this.position[0]][this.position[1]].ant++;

            let x2 = this.position[0];
            let y2 = this.position[1];
        
            this.path.push(this.position);

            this.setPixel(cellsPoints[variant].x, cellsPoints[variant].y, this.food);
            if(!this.food && !this.field[cellsPoints[variant].x][cellsPoints[variant].y].home && this.field[cellsPoints[variant].x][cellsPoints[variant].y].food <= 0){
                this.field[cellsPoints[variant].x][cellsPoints[variant].y].foodFeromone = Math.min(3000, this.field[cellsPoints[variant].x][cellsPoints[variant].y].foodFeromone + this.increasingFeromone / this.path.length ** 2);
            }
            else if(this.food && !this.field[cellsPoints[variant].x][cellsPoints[variant].y].home && this.field[cellsPoints[variant].x][cellsPoints[variant].y].food <= 0){
                this.field[cellsPoints[variant].x][cellsPoints[variant].y].homeFeromone = Math.min(3000, this.field[cellsPoints[variant].x][cellsPoints[variant].y].homeFeromone + this.increasingFeromone * (this.feromoneToDrop / this.path.length ** 2) ** this.foodValueCoef);
            }

            while (x1 !== x2 || y1 !== y2) {
                
                if(!this.field[x1][y1].wall){
                    
                    this.setPixel(x1, y1, this.food);

                    if(this.food && this.field[x1][y1].home){
                        this.dropFood();
                        return;
                    }

                    if(!this.food && this.field[x1][y1].food > 0){
                        this.takeFood();
                        return;
                    }

                    if(!this.food){
                        this.field[x1][y1].foodFeromone = Math.min(3000, this.field[x1][y1].foodFeromone + this.increasingFeromone * 100) / this.path.length ** 0.5;
                    }
                    else if(this.food){
                        this.field[x1][y1].homeFeromone = Math.min(3000, this.field[x1][y1].homeFeromone + this.increasingFeromone * this.feromoneToDrop ** this.foodValueCoef) / this.path.length ** 0.5;
                    }

                    if (x1 < x2) {
                        x1++;
                    }
                    else if (x1 > x2) {
                        x1--;
                    }
                    if (y1 < y2) {
                        y1++;
                    } else if (y1 > y2) {
                        y1--;
                    }
                }
            }
        }
    }

    createNextCells(){

        let cells = [8];
        for(let i = 0; i < 8; ++i){
            cells[i] = [8];
        }
    }

    leftCell(){

        let rot = (this.rotation - 1 < 0) ? 7 : this.rotation - 1;
        let cell = this.nextCell(rot);

        return cell;
    }

    forwardCell(){

        let rot = this.rotation;
        let cell = this.nextCell(rot);

        return cell;
    }

    rightCell(){
        let rot = (this.rotation + 1) % 8;
        let cell = this.nextCell(rot);

        return cell;
    }

    nextCell(rotation){

        let possibleDirections = [[0, -1], [ 1, -1], [ 1, 0], [ 1,  1], [0,  1], [-1,  1], [-1, 0], [-1, -1]];
        let rot = possibleDirections[rotation];
        
        let res = [];
        for(let i = 0; i < this.antStepDist; ++i){
            for(let j = 0; j < this.antStepDist; ++j){
                let arr = [(this.position[0] + rot[0] * i),
                    (this.position[1] + rot[1] * j)];

                    if(arr[0] >= 0 && arr[0] < this.fieldSize && arr[1] >= 0 && arr[1] < this.fieldSize && this.field[arr[0]][arr[1]].wall === false /*&&
                        !(this.food && field[arr[0]][arr[1]].food > 0) && !(!this.food && field[arr[0]][arr[1]].home)*/ && !(this.position[0] === arr[0] && this.position[1] === arr[1])){

                            let hasWallsOnPath = false;
                            let x1 = this.position[0];
                            let y1 = this.position[1];
                            let x2 = arr[0];
                            let y2 = arr[1];

                            while (x1 !== x2 || y1 !== y2) {
                            
                                if(this.field[x1][y1].wall === true){
                                    hasWallsOnPath = true;
                                    break;
                                }
                                
                                if (x1 < x2) {
                                    x1++;
                                } else if (x1 > x2) {
                                    x1--;
                                }

                                if(this.field[x1][y1].wall === true){
                                    hasWallsOnPath = true;
                                    break;
                                }

                                if (y1 < y2) {
                                    y1++;
                                } else if (y1 > y2) {
                                    y1--;
                                }
                            }
                            
                            if(!hasWallsOnPath){

                                res.push({arr, rotation});
                            }
                    }
            }
        }
        
        return res;
    }

    dropFood(){
        this.food = false;
        this.rotation = (this.rotation + 4) % 8;
    }

    takeFood(){

        this.field[this.position[0]][this.position[1]].food -= 1;

        this.feromoneToDrop = this.field[this.position[0]][this.position[1]].food;

        this.food = true;
        this.rotation = (this.rotation + 4) % 8;
    }

    
    setPixel(x, y, food) {

        let pixelData = this.ctx.getImageData(x * 4 + 40, y * 4 + 40, 1, 1).data;
        if(!this.field[x][y].home) {

            if(this.field[x][y].food > 0){

                pixelData[0] = 255 * (this.field[x][y].food - 1) / this.field[x][y].maxFood;
                pixelData[1] = 255 * (this.field[x][y].food - 1) / this.field[x][y].maxFood;
                pixelData[2] = 255 * (this.field[x][y].food - 1) / this.field[x][y].maxFood;
            }
            else{
        
                if(!food){
                    pixelData[0] += 30;
                    pixelData[0] = Math.min(pixelData[0], 255);
                }
                
                else{
                    pixelData[1] += 30;
                    pixelData[1] = Math.min(pixelData[1], 255);
                }
            }
            
            this.ctx.fillStyle = 'rgba(' + pixelData[0] + ',' + pixelData[1] + ',' + pixelData[2] + ',' + (pixelData[3] / 255) + ')';
            this.ctx.fillRect(x * 4 + 40, y * 4 + 40, 4, 4);
        }
    }
}