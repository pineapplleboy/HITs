import { PriorityQueue } from "./priorutyQueue.js";
import { isMouseDown } from "./main.js";
import { option } from "./functions.js";

export class Maze {

    constructor(size) {
        this.mazeSize = size;
        this.startCell = 0;
        this.finishCell = size * size - 1;
        this.buildingMode = 0; // -1 - стены, 0 - пусто, 1 - стартовая клетка, 2 - финишная клетка
        this.animationSpeed = 50; // скорость анимации (время в ms = 100 - animationSpeed)
        this.pause = false; // ставит на паузу отрисовку алгоритма
        this.running = false; // алгоритм за работой
        this.stopAlg = false; // гоп-стопаем алгоритм
    }

    // создание матрицы смежности (listOfEdges)
    getListOfEdges() { 
        this.listOfEdges = new Array();

        for (let i = 0; i < this.mazeSize; i++) {
            
            for (let j = 0; j < this.mazeSize; j++) {
                let tempArray = new Array();

                if (this.mazeMap[i][j] != -1) {
                    if (i != 0 && this.mazeMap[i - 1][j] >= 0) { // клетка сверху
                        tempArray.push((i - 1) * this.mazeSize + j);
                    }
    
                    if (j != 0 && this.mazeMap[i][j - 1] >= 0) { // клетка слева
                        tempArray.push(i* this.mazeSize + j - 1);
                    }
    
                    if (j != this.mazeSize - 1 && this.mazeMap[i][j + 1] >= 0) { // клетка справа
                        tempArray.push(i * this.mazeSize + j + 1);
                    }
    
                    if (i != this.mazeSize - 1 && this.mazeMap[i + 1][j] >= 0) { // клетка снизу
                        tempArray.push((i + 1) * this.mazeSize + j);
                    }
                }

                this.listOfEdges.push(tempArray);
            }

        }

    }

    // создаёт пустой массив size * size (mazeMap)
    buildClearMaze() {
        this.mazeMap = new Array();

        for (let i = 0; i < this.mazeSize; i++) {
            let tempArray = new Array();
            for (let j = 0; j < this.mazeSize; j++) {
                tempArray.push(0);
            }
            this.mazeMap.push(tempArray);
        }
    }

    // очищает массив лабиринта
    clearMaze() {
        for (let i = 0; i < this.mazeSize; i++) {
            for (let j = 0; j < this.mazeSize; j++) {
                if (i * this.mazeSize + j != this.startCell && i * this.mazeSize + j != this.finishCell) {
                    this.mazeMap[i][j] = 0;
                    const currentMazeCell = document.getElementById(`mazeCell${i * this.mazeSize + j}`);
                    currentMazeCell.style.background = "white";
                    currentMazeCell.style.borderColor = "gray";
                }
            }
        }
    }

    // очищает поля не белого/чёрного цвета
    clearAlg() {
        for (let i = 0; i < this.mazeSize; i++) {
            for (let j = 0; j < this.mazeSize; j++) {
                if (i * this.mazeSize + j != this.startCell && i * this.mazeSize + j != this.startCell && this.mazeMap[i][j] > 0) {
                    this.mazeMap[i][j] = 0;
                    this.paintCellBack(i * this.mazeSize + j);
                }
            }
        }
    }

    // ставит стартовую точку в ячейку number
    setStartCell(number) {
        if (number != this.finishCell) {
            const currentMazeCell = document.getElementById(`mazeCell${this.startCell}`);
            currentMazeCell.style.background = "white";
    
            this.startCell = number;
            this.mazeMap[Math.floor(number / this.mazeSize)][number % this.mazeSize] = 0;
            const newStartCell = document.getElementById(`mazeCell${this.startCell}`);
            newStartCell.style.background = "green";
        }      
    }

    // ставит конечную точку в ячейку number
    setFinishCell(number) {
        if (number != this.startCell) {
            const currentMazeCell = document.getElementById(`mazeCell${this.finishCell}`);
            currentMazeCell.style.background = "white";
    
            this.finishCell = number;
            this.mazeMap[Math.floor(number / this.mazeSize)][number % this.mazeSize] = 0;
            const newStartCell = document.getElementById(`mazeCell${this.finishCell}`);
            newStartCell.style.background = "red";
        }
    }

    // ставит стену в ячейку number
    setWall(number) { // пока что без именения списка ребёр
        const x = number % this.mazeSize;
        const y = Math.floor(number / this.mazeSize);
        if (number != this.startCell && number != this.finishCell && this.mazeMap[y][x] >= 0) { // если клетка пустая, ставит стену
            this.mazeMap[y][x] = -1;
            const currentMazeCell = document.getElementById(`mazeCell${number}`);
            currentMazeCell.style.background = "black";
            currentMazeCell.style.borderColor = "gray";  
        }
        else if (this.mazeMap[y][x] == -1) { // если занята, убирает стену
            this.mazeMap[y][x] = 0;
            const currentMazeCell = document.getElementById(`mazeCell${number}`);
            currentMazeCell.style.background = "white";
            currentMazeCell.style.borderColor = "gray";
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
            cellSize = (400 - this.mazeSize * 2) / this.mazeSize;
        }
        else if (ratio == 1.25) {
            cellSize = (400 - this.mazeSize * 1.6) / this.mazeSize;
        }
        else {

        }

        let code = `<div style='display: flex;'>`; // элементы в одной строчке
        for (let i = 0; i < this.mazeSize; i++) {
            let cellId = `mazeCell${number * this.mazeSize + i}`;

            let cursorType = "crosshair"; // крестик при наведении на клетку
            
            // onmousedown позволяет больше "спамить" нажатиями (лучше, чем onclick)

            let cellCode = `<div id='${cellId}'
            style='display: inline-block; width: ${cellSize}px; height: ${cellSize}px; cursor: ${cursorType}'></div>`;

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

        for (let i = 0; i < this.mazeSize; i++) { // создаём новое поле
            newMaze.insertAdjacentHTML('beforeend', this.getCellCode(i));


            for (let j = 0; j < this.mazeSize; j++) {
                let elem = document.getElementById(`mazeCell${i * this.mazeSize + j}`);
                elem.style.background = 'white';
                elem.style.padding = 0;
                elem.style.borderWidth = 1;
                elem.style.borderColor = 'gray';
                elem.style.borderStyle = 'solid';

                document.querySelector(`#mazeCell${i * this.mazeSize + j}`).onmousedown = function() { 
                    // присваиваем действия клеточкам
                    maze.changeCellType(i * maze.mazeSize + j); // нажатие на клетку
                }
    
                document.querySelector(`#mazeCell${i * this.mazeSize + j}`).onmouseover = function() {
                    maze.checkMouseButton(i * maze.mazeSize + j); // наведение на клетку
                }
    
                document.querySelector(`#mazeCell${i * this.mazeSize + j}`).onmouseleave = function() {
                    maze.paintCellBack(i * maze.mazeSize + j); // покидание клетки
                }

            }
        }
        this.startCell = 0;
        this.finishCell = this.mazeSize * this.mazeSize - 1;

        document.getElementById(`mazeCell${this.startCell}`).style.background = "green";

        document.getElementById(`mazeCell${this.finishCell}`).style.background = "red";
    }

    // окрашивает клетку в розовый
    paintPinkCell(number) {
        if (number != this.startCell && number != this.finishCell) {
            const currentMazeCell = document.getElementById(`mazeCell${number}`);
            currentMazeCell.style.background = "pink";
            currentMazeCell.style.borderColor = "gray";
        }
    }

    // окрашивает клетку обратно в её изначальный цвет
    paintCellBack(number) {
        if (number != this.startCell && number != this.finishCell) {
            const currentMazeCell = document.getElementById(`mazeCell${number}`);
            if (this.mazeMap[Math.floor(number / this.mazeSize)][number % this.mazeSize] == -1) {
                currentMazeCell.style.background = "black";
                currentMazeCell.style.borderColor = "gray";
            }
            else if (this.mazeMap[Math.floor(number / this.mazeSize)][number % this.mazeSize] == 0) {
                currentMazeCell.style.background = "white";
                currentMazeCell.style.borderColor = "gray";
            }
            else if (this.mazeMap[Math.floor(number / this.mazeSize)][number % this.mazeSize] == 1) {
                currentMazeCell.style.background = "gray";
            }
            else if (this.mazeMap[Math.floor(number / this.mazeSize)][number % this.mazeSize] == 2) {
                currentMazeCell.style.background = "yellow";
            }
            else if (this.mazeMap[Math.floor(number / this.mazeSize)][number % this.mazeSize] == 3) {
                currentMazeCell.style.background = "gold";
            }
        }
    }

    // генерация карты
    generateMap() { // здесь мы не строим стены, а как бы прорываем тоннели
        for (let i = 0; i < this.mazeSize; i++) {
            for (let j = 0; j < this.mazeSize; j++) {
                if (i * this.mazeSize + j != this.startCell && i * this.mazeSize + j != this.finishCell) {
                    this.setWall(i * this.mazeSize + j);
                }
            }
        }

        let toCheck = new Array(); // выносить это в отдельную функцию???
        //стартовая клетка
        if (this.startCell - 2 * this.mazeSize >= 0) { // через одну клетку сверху
            toCheck.push(this.startCell - 2 * this.mazeSize);
        }
        if (this.startCell + 2 * this.mazeSize <= this.mazeSize * this.mazeSize - 1) { // через одну клетку снизу
            toCheck.push(this.startCell + 2 * this.mazeSize);
        }
        if (this.startCell - 2 >= 0) { // через одну клетку слева
            toCheck.push(this.startCell - 2);
        }
        if (this.startCell + 2 <= this.mazeSize * this.mazeSize - 1) { // через одну клетку справа
            toCheck.push(this.startCell + 2);
        }

        while (toCheck.length > 0) {
            let index = Math.floor(Math.random() * toCheck.length); // очищаем 
            const currentCellNumber = toCheck[index];
            this.setWall(currentCellNumber);
            toCheck.splice(index, 1);

            let directions = Array();
            if (currentCellNumber - 2 * this.mazeSize >= 0) {
                directions.push(currentCellNumber - this.mazeSize); // добавляем клетки между выбранной клетой и пустой, находящейся через одну
            }
            if (currentCellNumber + 2 * this.mazeSize <= this.mazeSize * this.mazeSize - 1) {
                directions.push(currentCellNumber + Number(this.mazeSize));
            }
            if (currentCellNumber - 2 >= 0) {
                directions.push(currentCellNumber - 1);
            }
            if (currentCellNumber + 2 <= this.mazeSize * this.mazeSize - 1) {
                directions.push(currentCellNumber + 1)
            }

            if (directions.length > 0) {
                index = Math.floor(Math.random() * directions.length);
                this.setWall(directions[index]);
            }

            if (currentCellNumber - 2 * this.mazeSize >= 0 && 
                this.mazeMap[Math.floor((currentCellNumber - 2 * this.mazeSize) / this.mazeSize)][(currentCellNumber - 2 * this.mazeSize) % this.mazeSize] == -1
                && !toCheck.includes(currentCellNumber - 2 * this.mazeSize)) { // через одну клетку сверху
                toCheck.push(currentCellNumber - 2 * this.mazeSize);
            }
            if (currentCellNumber + 2 * this.mazeSize <= this.mazeSize * this.mazeSize - 1 && 
                this.mazeMap[Math.floor((currentCellNumber + 2 * this.mazeSize) / this.mazeSize)][(currentCellNumber + 2 * this.mazeSize) % this.mazeSize] == -1
                && !toCheck.includes(currentCellNumber + 2 * this.mazeSize)) { // через одну клетку снизу
                toCheck.push(currentCellNumber + 2 * this.mazeSize);
            }
            if (currentCellNumber - 2 >= 0 && 
                this.mazeMap[Math.floor((currentCellNumber - 2) / this.mazeSize)][(currentCellNumber - 2) % this.mazeSize] == -1
                && !toCheck.includes(currentCellNumber - 2)) { // через одну клетку слева
                toCheck.push(currentCellNumber - 2);
            }
            if (currentCellNumber + 2 <= this.mazeSize * this.mazeSize - 1 && 
                this.mazeMap[Math.floor((currentCellNumber + 2) / this.mazeSize)][(currentCellNumber + 2) % this.mazeSize] == -1
                && !toCheck.includes(currentCellNumber + 2)) { // через одну клетку справа
                toCheck.push(currentCellNumber + 2);
            }
        }

        for (let iteration = 0; iteration < 3; iteration++) {
            let deadCells = new Array();

            for (let i = 0; i < this.mazeSize; i++) {
                for (let j = 0; j < this.mazeSize; j++) {
                    if (this.mazeMap[i][j] == -1) continue;

                    let neighbours = new Array();

                    if (i > 0 && this.mazeMap[i - 1][j] == -1) {
                        neighbours.push((i - 1) * this.mazeSize + j);
                    }

                    if (i < this.mazeSize - 1 && this.mazeMap[i + 1][j] == -1) {
                        neighbours.push((i + 1) * this.mazeSize + j);
                    }

                    if (j > 0 && this.mazeMap[i][j - 1] == -1) {
                        neighbours.push(i* this.mazeSize + j - 1);
                    }

                    if (j < this.mazeSize - 1 && this.mazeMap[i][j + 1] == -1) {
                        neighbours.push(i* this.mazeSize + j + 1);
                    }

                    if (neighbours.length >= 3 - (i == 0 || i == this.mazeSize - 1) - (j == 0 || j == this.mazeSize - 1)) {
                        let index = Math.floor(Math.random() * neighbours.length);
                        const currentCellNumber = neighbours[index];
                        this.setWall(currentCellNumber);
                    }
                }
            }
        }
    }

    // генерация лабиринта
    generateMaze() {
        let weightMatrix = new Array();

        for (let i = 0; i < this.mazeSize; i++) {
            for (let j = 0; j < this.mazeSize; j++) {
                this.setWall(i * this.mazeSize + j);
            }
        }

        for (let i = 0; i < this.mazeSize; i++) {
            let temp = new Array();
            for (let j = 0; j < this.mazeSize; j++) {
                temp.push(Math.floor(Math.random() * 50));
            }
            weightMatrix.push(temp);
        }
        
        let queue = new PriorityQueue();
        let cameFrom = new Map();

        let startMazeCell = 0;

        if (startMazeCell - 2 * this.mazeSize >= 0) {
            queue.addElem(startMazeCell - 2 * this.mazeSize, weightMatrix[Math.floor((startMazeCell - 2 * this.mazeSize) / this.mazeSize)][(startMazeCell - 2 * this.mazeSize) % this.mazeSize]);
            this.setWall(startMazeCell - 2 * this.mazeSize);
            cameFrom.set(startMazeCell - 2 * this.mazeSize, startMazeCell);
        }
        if (startMazeCell + 2 * this.mazeSize <= this.mazeSize * this.mazeSize - 1) {
            queue.addElem(startMazeCell + 2 * Number(this.mazeSize), weightMatrix[Math.floor((startMazeCell + 2 * Number(this.mazeSize)) / this.mazeSize)][(startMazeCell + 2 * Number(this.mazeSize)) % this.mazeSize]);
            this.setWall(startMazeCell + 2 * Number(this.mazeSize));
            cameFrom.set(startMazeCell + 2 * this.mazeSize, startMazeCell);
        }
        if (startMazeCell % this.mazeSize - 2 >= 0) {
            queue.addElem(startMazeCell - 2, weightMatrix[Math.floor((startMazeCell - 2) / this.mazeSize)][(startMazeCell - 2) % this.mazeSize]);
            this.setWall(startMazeCell - 2);
            cameFrom.set(startMazeCell - 2, startMazeCell);
        }
        if (startMazeCell % this.mazeSize + 2 <= this.mazeSize - 1) {
            queue.addElem(startMazeCell + 2, weightMatrix[Math.floor((startMazeCell + 2) / this.mazeSize)][(startMazeCell + 2) % this.mazeSize]);
            this.setWall(startMazeCell + 2);
            cameFrom.set(startMazeCell + 2, startMazeCell);
        }
        
        while (queue.size() != 0) {
            let currentCell = queue.getElem();

            let cameFromCell = cameFrom.get(currentCell);
            if (this.mazeMap[Math.floor(((cameFromCell + currentCell) / 2) / this.mazeSize)][((cameFromCell + currentCell) / 2) % this.mazeSize] == -1) {
                this.setWall((cameFromCell + currentCell) / 2);
            }
            
            if (currentCell - 2 * this.mazeSize >= 0 && (this.mazeMap[Math.floor((currentCell - 2 * this.mazeSize) / this.mazeSize)][(currentCell - 2 * this.mazeSize) % this.mazeSize] == -1
            || currentCell - 2 * this.mazeSize == this.finishCell || currentCell - 2 * this.mazeSize == this.startCell)) {
                queue.addElem(currentCell - 2 * this.mazeSize, weightMatrix[Math.floor((currentCell - 2 * this.mazeSize) / this.mazeSize)][(currentCell - 2 * this.mazeSize) % this.mazeSize]);
                this.setWall(currentCell - 2 * this.mazeSize);
                cameFrom.set(currentCell - 2 * this.mazeSize, currentCell);
            }
            if (currentCell + 2 * Number(this.mazeSize) <= this.mazeSize * this.mazeSize - 1 && (this.mazeMap[Math.floor((currentCell + 2 * Number(this.mazeSize)) / this.mazeSize)][(currentCell + 2 * Number(this.mazeSize)) % this.mazeSize] == -1
            || currentCell + 2 * Number(this.mazeSize) == this.finishCell || currentCell + 2 * Number(this.mazeSize) == this.startCell)) {
                queue.addElem(currentCell + 2 * Number(this.mazeSize), weightMatrix[Math.floor((currentCell + 2 * Number(this.mazeSize)) / this.mazeSize)][(currentCell + 2 * Number(this.mazeSize)) % this.mazeSize]);
                this.setWall(currentCell + 2 * Number(this.mazeSize));
                cameFrom.set(currentCell + 2 * Number(this.mazeSize), currentCell);
            }
            if (currentCell % this.mazeSize - 2 >= 0 && (this.mazeMap[Math.floor((currentCell - 2) / this.mazeSize)][(currentCell - 2) % this.mazeSize] == -1 
            || currentCell - 2 == this.finishCell || currentCell - 2 == this.startCell)) {
                queue.addElem(currentCell - 2 , weightMatrix[Math.floor((currentCell - 2) / this.mazeSize)][(currentCell - 2) % this.mazeSize]);
                this.setWall(currentCell - 2);
                cameFrom.set(currentCell - 2, currentCell);
            }
            if (currentCell % this.mazeSize + 2 < this.mazeSize && (this.mazeMap[Math.floor((currentCell + 2) / this.mazeSize)][(currentCell + 2) % this.mazeSize] == -1 
            || currentCell + 2 == this.finishCell || currentCell + 2 == this.startCell)) {
                queue.addElem(currentCell + 2, weightMatrix[Math.floor((currentCell + 2) / this.mazeSize)][(currentCell + 2) % this.mazeSize]);
                this.setWall(currentCell + 2);
                cameFrom.set(currentCell + 2, currentCell);
            }
        }

        if (this.mazeSize % 2 == 0) { // удаляем стенки, которые остались по краям
            let clearNearFinish = new Array();
            
            for (let i = 0; i < this.mazeSize; i++) {

                let currentCellVert = this.mazeSize * (i + 1) - 1;

                if (currentCellVert === this.finishCell && 
                    this.mazeMap[Math.floor((currentCellVert - this.mazeSize) / this.mazeSize)][(currentCellVert - this.mazeSize) % this.mazeSize] == -1) {
                        clearNearFinish.push(currentCellVert - this.mazeSize);
                }
                else if (Math.floor(Math.random() * 2) && this.mazeMap[Math.floor((currentCellVert - 1) / this.mazeSize)][(currentCellVert - 1) % this.mazeSize] >= 0) {
                    this.setWall(currentCellVert);
                }

                let currentCellHor = this.mazeSize * (this.mazeSize - 1) + i;


                if (currentCellHor == this.finishCell && 
                    this.mazeMap[Math.floor((currentCellHor - 1) / this.mazeSize)][(currentCellHor - 1) % this.mazeSize] == -1) {
                    clearNearFinish.push(currentCellHor - 1);
                }
                else if (Math.floor(Math.random() * 2) && 
                this.mazeMap[Math.floor((currentCellHor - this.mazeSize) / this.mazeSize)][(currentCellHor - this.mazeSize) % this.mazeSize] >= 0) {

                    this.setWall(currentCellHor);
                }

            }

            // проверка, заняты ли соседние стены
            if (clearNearFinish.length == 2) {
                const index = Math.floor(Math.random() * clearNearFinish.length);
                this.setWall(clearNearFinish[index]);
            }

        }
    }

    // окрашивает клетку из очереди
    wallIsGettingReady(number) {
        if (number != this.startCell && number != this.finishCell) {
            const currentMazeCell = document.getElementById(`mazeCell${number}`);
            this.mazeMap[Math.floor(number / this.mazeSize)][number % this.mazeSize] = 1;
            currentMazeCell.style.background = "gray";
        }
    }

    // окрашивает уже просмотренную клетку
    wallIsReviewed(number) {
        if (number != this.startCell && number != this.finishCell) {
            const currentMazeCell = document.getElementById(`mazeCell${number}`);
            this.mazeMap[Math.floor(number / this.mazeSize)][number % this.mazeSize] = 2;
            currentMazeCell.style.background = "yellow";
        }
    }

    // окрашивает клетку, являющуюся частью пути
    wallIsPartOfTheWay(number) {
        if (number != this.startCell && number != this.finishCell) {
            const currentMazeCell = document.getElementById(`mazeCell${number}`);
            this.mazeMap[Math.floor(number / this.mazeSize)][number % this.mazeSize] = 3;
            currentMazeCell.style.background = "gold";
        }
    }

    // меняет тип клетки в зависимости от текущего режима строительства
    changeCellType(number) {
        if (this.running) {
            return;
        }

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
        if (isMouseDown && this.buildingMode == 0 && !this.running) {
            this.setWall(number);
        }
        else {
            this.paintPinkCell(number);
        }

    }

    // вычисляет расстояние между двумя клетками (для алгоритма)
    getDist(first, second) {
        let firstX = Math.floor(first / this.mazeSize);
        let firstY = first % this.mazeSize;

        let secondX = Math.floor(second / this.mazeSize);
        let secondY = second % this.mazeSize;
        return Math.abs(firstX - secondX) + Math.abs(firstY - secondY);
    }

    // запускает алгоритм
    goAlg() {
        this.stopAlg = false;
        this.getListOfEdges();
        this.clearAlg();
        let queue = new PriorityQueue();
        queue.addElem(this.startCell);
        let cameFrom = new Map();
        let cost = new Map();
        cameFrom.set(this.startCell, undefined);
        cost.set(this.startCell, 0);

        this.running = true;

        document.getElementById("pauseButton").disabled = false;

        let succes = false;

        let elements = ["slider", "generateMapButton", "clearMapButton", "clearAlgButton",
         "goAlgButton", "selectBuildingMode", "sliderAnimation", "generateMazeButton"];

        for (let elem of elements) {
            document.getElementById(elem).disabled = true; // блокируем все элементы
        }


        const IntervalId = setInterval(function() {
            if (maze.stopAlg) {
                maze.stopAlg = false;
                maze.running = false;
                maze.pause = false;
                for (let elem of elements) { // разблокируем все элементы
                    document.getElementById(elem).disabled = false;
                }
                document.getElementById("pauseButton").disabled = true;
                document.getElementById("pauseButton").textContent = "Пауза";
                clearInterval(IntervalId);
            }

            if (queue.size() > 0 && !maze.pause) {
                let currentNode = queue.getElem();
            
                if (currentNode == maze.finishCell) {
                    succes = true;
                    clearInterval(IntervalId);
                }

                maze.wallIsReviewed(currentNode); // достали стену из очереди - покрасили жёлтым

                for (let elem of maze.listOfEdges[currentNode]) {
                    let newCost = cost.get(currentNode) + 1;

                    if (!cost.has(elem) || cost[elem] > newCost) {

                        if (!cost.has(elem)) {
                            cost.set(elem, newCost);
                            cameFrom.set(elem, currentNode);
                        }
                        else {
                            cost[elem] = newCost;
                        }

                        let priority = newCost + maze.getDist(elem, maze.finishCell);
                        queue.addElem(elem, priority);
                        maze.wallIsGettingReady(elem); // поставили стену в очередь - покрасили серым
                        
                    }
                }

            }

            if (succes) {
                let wayCell = maze.finishCell;

                const printIntervalId = setInterval(function() {
                    if (maze.stopAlg) {
                        maze.stopAlg = false;
                        maze.running = false;
                        maze.pause = false;
                        for (let elem of elements) { // разблокируем все элементы
                            document.getElementById(elem).disabled = false;
                        }
                        document.getElementById("pauseButton").disabled = true;
                        document.getElementById("pauseButton").value = "Пауза";
                        clearInterval(IntervalId);
                        clearInterval(printIntervalId);
                    }

                    if (!maze.pause) {
                        if (wayCell == maze.startCell) {
                            for (let elem of elements) { // разблокируем все элементы
                                document.getElementById(elem).disabled = false;
                            }
                            document.getElementById("pauseButton").disabled = true;
                            maze.running = false;
                            clearInterval(printIntervalId);
                        }
                        else {
                            maze.wallIsPartOfTheWay(wayCell);
                            wayCell = cameFrom.get(wayCell);
                    }
                    }
                }, 100 - maze.animationSpeed)
            }
            else if (queue.size() == 0) {
                for (let elem of elements) { // разблокируем все элементы
                    document.getElementById(elem).disabled = false;
                }
                document.getElementById("pauseButton").disabled = true;
                maze.running = false;
                alert(":(");
                clearInterval(IntervalId);
            }

        }, 100 - this.animationSpeed)
    }

}

export let maze = new Maze(17);
