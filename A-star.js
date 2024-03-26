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

class Maze {

    constructor(size) {
        this.mazeSize = size;
        this.startCell = 0;
        this.finishCell = size * size - 1;
        this.buildingMode = 0; // 0 - стены, 1 - стартовая клетка, 2 - финишная клетка
    }

    // создание матрицы смежности (listOfEdges)
    getListOfEdges() { 
        this.listOfEdges = new Array();

        for (let i = 0; i < size; i++) {
            
            for (let j = 0; j < size; j++) {
                let tempArray = new Array();

                if (this.mazeMap[i][j] != -1) {
                    if (i != 0 && this.mazeMap[i - 1][j] >= 0) { // клетка сверху
                        tempArray.push((i - 1) * size + j);
                    }
    
                    if (j != 0 && this.mazeMap[i][j - 1] >= 0) { // клетка слева
                        tempArray.push(i* size + j - 1);
                    }
    
                    if (j != size - 1 && this.mazeMap[i][j + 1] >= 0) { // клетка справа
                        tempArray.push(i * size + j + 1);
                    }
    
                    if (i != size - 1 && this.mazeMap[i + 1][j] >= 0) { // клетка снизу
                        tempArray.push((i + 1) * size + j);
                    }
                }

                this.listOfEdges.push(tempArray);
            }

        }

    }

    // создаёт пустой массив size * size (mazeMap)
    buildClearMaze() {
        this.mazeMap = new Array();

        for (let i = 0; i < size; i++) {
            let tempArray = new Array();
            for (let j = 0; j < size; j++) {
                tempArray.push(0);
            }
            this.mazeMap.push(tempArray);
        }
    }

    // очищает массив лабиринта
    clearMaze() {
        for (let i = 0; i < size; i++) {
            for (let j = 0; j < size; j++) {
                if (i * size + j != this.startCell && i * size + j != this.finishCell) {
                    this.mazeMap[i][j] = 0;
                    const currentMazeCell = document.getElementById(`mazeCell${i * size + j}`);
                    currentMazeCell.style.background = "white";
                    currentMazeCell.style.borderColor = "black";
                }
            }
        }
    }

    // очищает поля не белого/чёрного цвета
    clearAlg() {
        for (let i = 0; i < size; i++) {
            for (let j = 0; j < size; j++) {
                if (i * size + j != this.startCell && i * size + j != this.startCell && this.mazeMap[i][j] > 0) {
                    this.mazeMap[i][j] = 0;
                    this.paintCellBack(i * size + j);
                }
            }
        }
    }

    // ставит стартовую точку в ячейку number
    setStartCell(number) {
        const currentMazeCell = document.getElementById(`mazeCell${this.startCell}`);
        currentMazeCell.style.background = "white";

        this.startCell = number;
        this.mazeMap[Math.floor(number / size)][number % size] = 0;
        const newStartCell = document.getElementById(`mazeCell${this.startCell}`);
        newStartCell.style.background = "green";
    }

    // ставит конечную точку в ячейку number
    setFinishCell(number) {
        const currentMazeCell = document.getElementById(`mazeCell${this.finishCell}`);
        currentMazeCell.style.background = "white";

        this.finishCell = number;
        this.mazeMap[Math.floor(number / size)][number % size] = 0;
        const newStartCell = document.getElementById(`mazeCell${this.finishCell}`);
        newStartCell.style.background = "red";

    }

    // ставит стену в ячейку number
    setWall(number) { // пока что без именения списка ребёр
        const x = number % size;
        const y = Math.floor(number / size);
        if (number != this.startCell && number != this.finishCell && this.mazeMap[y][x] >= 0) { // если клетка пустая, ставит стену
            this.mazeMap[y][x] = -1;
            const currentMazeCell = document.getElementById(`mazeCell${number}`);
            currentMazeCell.style.background = "black";
            currentMazeCell.style.borderColor = "white";  
        }
        else if (this.mazeMap[y][x] == -1) { // если занята, убирает стену
            this.mazeMap[y][x] = 0;
            const currentMazeCell = document.getElementById(`mazeCell${number}`);
            currentMazeCell.style.background = "white";
            currentMazeCell.style.borderColor = "black";
        }
        else {
            //alert("Нельзя так"); // если пытается поставить с старт или финиш, выдаёт ошибку
        }
    }

    // создать ряд клеток с номером number
    getCellCode(number) {
        const ratio = window.devicePixelRatio; // масштабирование монитора

        let cellSize;
        if (ratio == 1) { // для разного масштабирования разные размеры
            cellSize = (400 - size * 2) / size;
        }
        else if (ratio == 1.25) {
            cellSize = (400 - size * 1.6) / size;
        }
        else {

        }

        let code = `<div style='display: flex;'>`; // элементы в одной строчке
        for (let i = 0; i < size; i++) {
            let cellId = `mazeCell${number * size + i}`;
            //let cursorType = (number * size + i == this.startCell || number * size + i == this.finishCell) ? "grab" : "crosshair"; // если навести на обычную клетку - крестик
            // на старт/финиш - рука
            let cursorType = "crosshair";
            
            // onmousedown позволяет больше "спамить" нажатиями
            let cellCode = `<div id='${cellId}'
            style='display: inline-block; width: ${cellSize}px; height: ${cellSize}px; cursor: ${cursorType}' onmousedown="maze.changeCellType(${number * size + i})"
            onmouseover="maze.checkMouseButton(${number * size + i})"
            onmouseleave="maze.paintCellBack(${number * size + i})"></div>`;

            // style='display: inline-block; width: ${cellSize}px; height: ${cellSize}px; cursor: ${cursorType}' onmouseleave="maze.paintCellBack(${number * size + i})" 
            // onmouseenter="maze.paintPinkCell(${number * size + i})" onmousedown="maze.setWall(${number * size + i})"></div>`;

            // ниже - рисование (но с пролагиваниями)
            // style='display: inline-block; width: ${cellSize}px; height: ${cellSize}px; cursor: ${cursorType}' onmousedown="maze.setWall(${number * size + i})"
            // onmouseover="maze.checkMouseButton(${number * size + i})"
            // onmouseleave="maze.paintCellBack(${number * size + i})"></div>`;

            // добавляем характеристики клетки + возможность кликнуть на неё
            code += cellCode;
        }

        code += "</div>";
        return code;
    }

    // вывести чистое "игровое" поле
    drawMaze() {
        const newMaze = document.getElementById("maze");
        newMaze.innerHTML = ""; // очищаем поле

        for (let i = 0; i < size; i++) { // создаём новое поле
            newMaze.insertAdjacentHTML('beforeend', this.getCellCode(i));

            for (let j = 0; j < size; j++) {
                let elem = document.getElementById(`mazeCell${i * size + j}`);
                elem.style.background = 'white';
                elem.style.padding = 0;
                elem.style.borderWidth = 1;
                elem.style.borderColor = 'black';
                elem.style.borderStyle = 'solid';

                // if (i * size + j == this.startCell || i * size + j == this.finishCell) { // возможность двигать элемент
                //     elem.draggable = "true";
                // }
            }
        }
        this.startCell = 0;
        this.finishCell = size * size - 1;

        document.getElementById(`mazeCell${this.startCell}`).style.background = "green";

        document.getElementById(`mazeCell${this.finishCell}`).style.background = "red";
    }

    // окрашивает клетку в розовый
    paintPinkCell(number) {
        if (number != this.startCell && number != this.finishCell) {
            const currentMazeCell = document.getElementById(`mazeCell${number}`);
            currentMazeCell.style.background = "pink";
            currentMazeCell.style.borderColor = "black";
        }
    }

    // окрашивает клетку обратно в её изначальный цвет
    paintCellBack(number) {
        if (number != this.startCell && number != this.finishCell) {
            const currentMazeCell = document.getElementById(`mazeCell${number}`);
            if (this.mazeMap[Math.floor(number / size)][number % size] == -1) {
                currentMazeCell.style.background = "black";
                currentMazeCell.style.borderColor = "white";
            }
            else if (this.mazeMap[Math.floor(number / size)][number % size] == 0) {
                currentMazeCell.style.background = "white";
                currentMazeCell.style.borderColor = "black";
            }
            else if (this.mazeMap[Math.floor(number / size)][number % size] == 1) {
                currentMazeCell.style.background = "gray";
            }
            else if (this.mazeMap[Math.floor(number / size)][number % size] == 2) {
                currentMazeCell.style.background = "yellow";
            }
            else if (this.mazeMap[Math.floor(number / size)][number % size] == 3) {
                currentMazeCell.style.background = "gold";
            }
        }
    }

    // генерация карты (изменённый https://habr.com/ru/articles/537630/)
    generateMap() { // здесь мы не строим стены, а как бы прорываем тоннели
        for (let i = 0; i < size; i++) {
            for (let j = 0; j < size; j++) {
                if (i * size + j != this.startCell && i * size + j != this.finishCell) {
                    this.setWall(i * size + j);
                }
            }
        }

        let toCheck = new Array(); // выносить это в отдельную функцию???
        //стартовая клетка
        if (this.startCell - 2 * size >= 0) { // через одну клетку сверху
            toCheck.push(this.startCell - 2 * size);
        }
        if (this.startCell + 2 * size <= size * size - 1) { // через одну клетку снизу
            toCheck.push(this.startCell + 2 * size);
        }
        if (this.startCell - 2 >= 0) { // через одну клетку слева
            toCheck.push(this.startCell - 2);
        }
        if (this.startCell + 2 <= size * size - 1) { // через одну клетку справа
            toCheck.push(this.startCell + 2);
        }

        //финишная клетка
        // if (this.finishCell - 2 * size >= 0) { // через одну клетку сверху
        //     toCheck.push(this.finishCell - 2 * size);
        // }
        // if (this.finishCell + 2 * size <= size * size - 1) { // через одну клетку снизу
        //     toCheck.push(this.finishCell + 2 * size);
        // }
        // if (this.finishCell - 2 >= 0) { // через одну клетку слева
        //     toCheck.push(this.finishCell - 2);
        // }
        // if (this.finishCell + 2 <= size * size - 1) { // через одну клетку справа
        //     toCheck.push(this.finishCell + 2);
        // }

        while (toCheck.length > 0) {
            let index = Math.floor(Math.random() * toCheck.length); // очищаем 
            const currentCellNumber = toCheck[index];
            this.setWall(currentCellNumber);
            toCheck.splice(index, 1);

            let directions = Array();
            if (currentCellNumber - 2 * size >= 0) {
                directions.push(currentCellNumber - size); // добавляем клетки между выбранной клетой и пустой, находящейся через одну
            }
            if (currentCellNumber + 2 * size <= size * size - 1) {
                directions.push(currentCellNumber + Number(size));
            }
            if (currentCellNumber - 2 >= 0) {
                directions.push(currentCellNumber - 1);
            }
            if (currentCellNumber + 2 <= size * size - 1) {
                directions.push(currentCellNumber + 1)
            }

            if (directions.length > 0) {
                index = Math.floor(Math.random() * directions.length);
                this.setWall(directions[index]);
            }

            if (currentCellNumber - 2 * size >= 0 && 
                this.mazeMap[Math.floor((currentCellNumber - 2 * size) / size)][(currentCellNumber - 2 * size) % size] == -1
                && !toCheck.includes(currentCellNumber - 2 * size)) { // через одну клетку сверху
                toCheck.push(currentCellNumber - 2 * size);
            }
            if (currentCellNumber + 2 * size <= size * size - 1 && 
                this.mazeMap[Math.floor((currentCellNumber + 2 * size) / size)][(currentCellNumber + 2 * size) % size] == -1
                && !toCheck.includes(currentCellNumber + 2 * size)) { // через одну клетку снизу
                toCheck.push(currentCellNumber + 2 * size);
            }
            if (currentCellNumber - 2 >= 0 && 
                this.mazeMap[Math.floor((currentCellNumber - 2) / size)][(currentCellNumber - 2) % size] == -1
                && !toCheck.includes(currentCellNumber - 2)) { // через одну клетку слева
                toCheck.push(currentCellNumber - 2);
            }
            if (currentCellNumber + 2 <= size * size - 1 && 
                this.mazeMap[Math.floor((currentCellNumber + 2) / size)][(currentCellNumber + 2) % size] == -1
                && !toCheck.includes(currentCellNumber + 2)) { // через одну клетку справа
                toCheck.push(currentCellNumber + 2);
            }
        }

        for (let iteration = 0; iteration < 3; iteration++) {
            let deadCells = new Array();

            for (let i = 0; i < size; i++) {
                for (let j = 0; j < size; j++) {
                    if (this.mazeMap[i][j] == -1) continue;

                    let neighbours = new Array();

                    if (i > 0 && this.mazeMap[i - 1][j] == -1) {
                        neighbours.push((i - 1) * size + j);
                    }

                    if (i < size - 1 && this.mazeMap[i + 1][j] == -1) {
                        neighbours.push((i + 1) * size + j);
                    }

                    if (j > 0 && this.mazeMap[i][j - 1] == -1) {
                        neighbours.push(i* size + j - 1);
                    }

                    if (j < size - 1 && this.mazeMap[i][j + 1] == -1) {
                        neighbours.push(i* size + j + 1);
                    }

                    if (neighbours.length >= 3 - (i == 0 || i == size - 1) - (j == 0 || j == size - 1)) {
                        let index = Math.floor(Math.random() * neighbours.length);
                        const currentCellNumber = neighbours[index];
                        this.setWall(currentCellNumber);
                    }
                }
            }
        }
    }

    // окрашивает клетку из очереди
    wallIsGettingReady(number) {
        if (number != this.startCell && number != this.finishCell) {
            const currentMazeCell = document.getElementById(`mazeCell${number}`);
            this.mazeMap[Math.floor(number / size)][number % size] = 1;
            currentMazeCell.style.background = "gray";
        }
    }

    // окрашивает уже просмотренную клетку
    wallIsReviewed(number) {
        if (number != this.startCell && number != this.finishCell) {
            const currentMazeCell = document.getElementById(`mazeCell${number}`);
            this.mazeMap[Math.floor(number / size)][number % size] = 2;
            currentMazeCell.style.background = "yellow";
        }
    }

    // окрашивает клетку, являющуюся частью пути
    wallIsPartOfTheWay(number) {
        if (number != this.startCell && number != this.finishCell) {
            const currentMazeCell = document.getElementById(`mazeCell${number}`);
            this.mazeMap[Math.floor(number / size)][number % size] = 3;
            currentMazeCell.style.background = "gold";
        }
    }

    // меняет тип клетки в зависимости от текущего режима строительства
    changeCellType(number) {
        if (this.buildingMode == 0) {
            this.setWall(number);
        }
        else if (this.buildingMode == 1) {
            this.setStartCell(number);
        }
        else {
            this.setFinishCell(number);
        }
        
    }

    // проверяет, нажата ли кнопка мыши
    checkMouseButton(number) {

        if (isMouseDown && this.buildingMode == 0) {
            // document.getElementById(`mazeCell${number}`).onmouseover = function(event) {
            //     if (event.which == 2) {maze.setWall(number);} // Нажато колёсико мыши
            // }
            // !!! рекомендовано именно рисовать стенки на колёсико мыши
            this.setWall(number);
        }
        else {
            this.paintPinkCell(number);
        }

        // document.getElementById(`mazeCell${number}`).addEventListener("mousedown", function(event) {
        //     event.preventDefault();
        //     event.stopPropagation();
        // });
    }

    // вычисляет расстояние между двумя клетками (для алгоритма)
    getDist(first, second) {
        let firstX = Math.floor(first / size);
        let firstY = first % size;

        let secondX = Math.floor(second / size);
        let secondY = second % size;
        return Math.abs(firstX - secondX) + Math.abs(firstY - secondY);
    }

    // запускает алгоритм
    goAlg() {
        this.getListOfEdges();
        this.clearAlg();
        let queue = new PriorityQueue();
        queue.addElem(this.startCell);
        let cameFrom = new Map();
        let cost = new Map();
        cameFrom.set(this.startCell, undefined);
        cost.set(this.startCell, 0);

        let succes = false;

        while (queue.size() != 0) {

            let currentNode = queue.getElem();

            if (currentNode == this.finishCell) {
                succes = true;
                break;
            }

            this.wallIsReviewed(currentNode); // достали стену из очереди - покрасили жёлтым

            for (let elem of this.listOfEdges[currentNode]) {
                let newCost = cost.get(currentNode) + 1;

                if (!cost.has(elem) || cost[elem] > newCost) {

                    if (!cost.has(elem)) {
                        cost.set(elem, newCost);
                        cameFrom.set(elem, currentNode);
                    }
                    else {
                        cost[elem] = newCost;
                    }

                    let priority = newCost + this.getDist(elem, this.finishCell);
                    queue.addElem(elem, priority);

                    this.wallIsGettingReady(elem); // поставили стену в очередь - покрасили серым
                    
                }
            }
        }
        
        if (succes) {
            let wayCell = this.finishCell;
            while (wayCell != this.startCell) {
                this.wallIsPartOfTheWay(wayCell);
                wayCell = cameFrom.get(wayCell);
            }
        }
        else {
            alert(":(");
        }
        
    }

}

let isMouseDown = false;

document.body.onmousedown = function() { 
  isMouseDown = true;
}
document.body.onmouseup = function() {
  isMouseDown = false;
}

let maze = new Maze(16);
resizeMaze();

function resizeMaze() {
    size = document.getElementById("slider").value;
    maze.size = size;
    maze.buildClearMaze();
    maze.drawMaze();
}

function generateClick() {
    maze.clearMaze();
    maze.generateMap();
}

function selectBuildMode() {
    option = document.getElementById("selectBuildingMode").value;
    if (option == "option1") {
        maze.buildingMode = 0;
    }
    else if (option == "option2") {
        maze.buildingMode = 1;
    }
    else {
        maze.buildingMode = 2;
    }
}
