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

const dialog = document.querySelector("dialog");  // информация

document.querySelector("#infoButton").onclick = function() {
    dialog.showModal();
}

document.querySelector("#closeDialog").onclick = function() {
    dialog.close();
}

window.sessionStorage.setItem("slide", 0); // на какой слайд возвращаемся

document.querySelector("#backButton").onclick = function() {
    window.location.href = "../sliderMenu";
}

window.addEventListener('resize', (e) => { // перенос на другой монитор
    maze.drawMaze();
})

document.querySelector("#sliderResult").oninput = function() {
    
    if (document.getElementById("sliderResult").value != undefined) {
        console.log(document.getElementById("sliderResult").value.length)
        if (document.getElementById("sliderResult").value.length > 1 && document.getElementById("sliderResult").value[0] == "0") {
            document.getElementById("sliderResult").value = Number(document.getElementById("sliderResult").value[1]);
        }

        document.getElementById("sliderResult").value = Math.min(document.getElementById("sliderResult").value, 31);
        document.getElementById("slider").value = document.getElementById("sliderResult").value;
        resizeMaze(true);
    }

    setTimeout(function() {
        document.getElementById("sliderResult").value = Math.max(4, document.getElementById("sliderResult").value);
    }, 5000)
    
}

if (!document.querySelector("#sliderResult").active) {
    
}