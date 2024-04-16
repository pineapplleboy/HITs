import { maze } from "./mazeClass.js";

let size = 17;    
export let option = 0;

export function resizeMaze() {
    size = document.getElementById("slider").value;
    maze.mazeSize = size;
    maze.buildClearMaze();
    maze.drawMaze();
}

export function selectBuildMode() {
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

export function setAnimationSpeed() {
    maze.animationSpeed = document.getElementById("sliderAnimation").value;
}

export function setPause() {
    if (!maze.pause) {
        document.getElementById("pauseButton").textContent = "Продолжить";
    }
    else {
        document.getElementById("pauseButton").textContent = "Пауза";
    }
    maze.pause = (maze.pause) ? false : true;
}
