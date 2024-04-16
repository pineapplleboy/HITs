import { maze } from "./mazeClass.js";
import { resizeMaze, selectBuildMode, setAnimationSpeed, setPause } from "./functions.js";

export let isMouseDown = false;
resizeMaze();

// если нажато колёсико мыши, запоминаем
document.body.onmousedown = function(event) { 
    if (event.which == 2) {
        isMouseDown = true;
    }
}

// колёсико больше не нажато
document.body.onmouseup = function() {
  isMouseDown = false;
}

// по двойному нажатию на паузу выключаем алгоритм
document.getElementById("pauseButton").addEventListener('dblclick', event => { 
    maze.stopAlg = true;
})

document.querySelector('#slider').oninput = function() { // изменение размера карты
    resizeMaze();
}

document.querySelector("#generateMapButton").onclick = function() { // генерация карты
    maze.clearMaze();
    maze.generateMap();
}

document.querySelector("#generateMazeButton").onclick = function() { // генерация лабиринта
    maze.clearMaze();
    maze.generateMaze();
}

document.querySelector("#clearMapButton").onclick = function() { // очистка карты
    maze.clearMaze();
}

document.querySelector("#clearAlgButton").onclick = function() { // очистка результата работы алгоритма
    maze.clearAlg();
}

document.querySelector("#goAlgButton").onclick = function() { // запуск алгоритма
    maze.goAlg();
}

document.querySelector("#pauseButton").onclick = function() { // пауза алгоритма
    setPause();
}

document.querySelector('#selectBuildingMode').oninput = function() { // выбор режима строительства
    selectBuildMode();
}

document.querySelector('#sliderAnimation').oninput = function() { // выбор скорости анимации
    setAnimationSpeed();
}