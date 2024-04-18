import {ant} from './antClass.js';
import {map} from './map.js';

let canvas = document.getElementById("antCanvas");
canvas.width = 520;
canvas.height = 520;
canvas.style.alignSelf = 'center';
canvas.style.justifySelf = 'center';
let ctx = canvas.getContext('2d');
ctx.fillStyle = 'black';
ctx.fillRect(0, 0, canvas.width, canvas.height);

let antMap;
let ants;

let fieldSize = 110;
let antsAmount = 200;
let newAntsAmount = 200;

let feromoneCoef = 5;
let antsInCellCoef = 10;
let foodValueCoef = 500;
let decreasingFeromone = 0.85;
let increasingFeromone = 20;
let antStepDist = 14;

let foodValue = 10;

let buildMode = 0;
let pauseMode = true;

canvas.addEventListener("mouseenter", mouseenterHandler);
canvas.addEventListener("mousemove", mousemoveHandler);
canvas.addEventListener("mouseleave", mouseleaveHandler);
canvas.addEventListener("mousedown", mousedownHandler);

document.getElementById("antsAmount").addEventListener("input", updateParameters);
document.getElementById("feromoneCoef").addEventListener("input", updateParameters);
document.getElementById("antsInCellCoef").addEventListener("input", updateParameters);
document.getElementById("foodValueCoef").addEventListener("input", updateParameters);
document.getElementById("decreasingFeromone").addEventListener("input", updateParameters);
document.getElementById("increasingFeromone").addEventListener("input", updateParameters);
document.getElementById("foodValue").addEventListener("input", updateParameters);
document.getElementById("antStepDist").addEventListener("input", updateParameters);

document.querySelector('#setWall').onclick = function(){
    buildMode = 0;
}

document.querySelector('#setFood').onclick = function(){
    buildMode = 1;
}

document.querySelector('#setHome').onclick = function(){
    buildMode = 2;
}

document.querySelector('#startSimulation').onclick = function(){
    pauseMode = false;
    spawnAnts();
    makeSimulationStep();
}

document.querySelector('#pauseAntSim').onclick = function(){
    pauseMode = !pauseMode;
    if(!pauseMode){
        makeSimulationStep();
    }
}

const mouse = {
    x: 0,
    y: 0,
    over: false,
}

function updateParameters() {

    newAntsAmount = parseInt(document.getElementById("antsAmount").value);
    for(let i = 0; i < antsAmount; ++i){
        ants[i].feromoneCoef = parseInt(document.getElementById("feromoneCoef").value);
        ants[i].antsInCellCoef = parseInt(document.getElementById("antsInCellCoef").value);
        ants[i].foodValueCoef = parseInt(document.getElementById("foodValueCoef").value)
        ants[i].antStepDist = parseInt(document.getElementById("antStepDist").value);
    }
    
    decreasingFeromone = parseInt(document.getElementById("decreasingFeromone").value) / 100;
    increasingFeromone = parseInt(document.getElementById("increasingFeromone").value);
    foodValue = parseInt(document.getElementById("foodValue").value);
}

function mouseenterHandler(event){
    mouse.over = true;
}

function mousemoveHandler(event){
    const rect = canvas.getBoundingClientRect();
    mouse.x = event.clientX - rect.left;
    mouse.y = event.clientY - rect.top;
}

function mouseleaveHandler(event){
    mouse.over = false;
}

function mousedownHandler(event){

    if(buildMode === 0){
        antMap.setWall(Math.floor((mouse.x - 40) / 40) * 10, Math.floor((mouse.y - 40 ) / 40) * 10);
    }
    else if(buildMode === 1){
        antMap.setFood(Math.floor((mouse.x - 40) / 20) * 5, Math.floor((mouse.y - 40) / 20) * 5);
    }
    else if(buildMode === 2){
        antMap.setHome(Math.floor((mouse.x - 40) / 40) * 10, Math.floor((mouse.y - 40) / 40) * 10);

        for(let i = 0; i < antsAmount; ++i){
            ants[i].homePoint = [Math.floor((mouse.x - 40) / 40) * 10, Math.floor((mouse.y - 40) / 40) * 10];
        }
    }
}

function createNewField(){
    
    antMap = new map(fieldSize, ctx, decreasingFeromone, foodValue);
    antMap.startSimulation();
    
    spawnAnts();
}

function spawnAnts(){

    ants = null;
    ants = [antsAmount];
    for(let i = 0; i < antsAmount; ++i){
        ants[i] = new ant(antMap.homePoint, antMap.fieldSize, antMap.field, ctx, foodValue, feromoneCoef, antsInCellCoef, increasingFeromone, foodValueCoef, antStepDist);
    }
    antMap.clearFeromones();
}

function makeSimulationStep() {

    if(newAntsAmount < antsAmount){
        ants.splice(newAntsAmount, antsAmount - newAntsAmount);
        antsAmount = newAntsAmount;
    }
    else if(newAntsAmount > antsAmount){

        for(let i = 0; i < newAntsAmount - antsAmount; ++i){
            ants.push(new ant(antMap.homePoint, antMap.fieldSize, antMap.field, ctx, foodValue, feromoneCoef, antsInCellCoef, increasingFeromone, foodValueCoef, antStepDist));
        }
        antsAmount = newAntsAmount;
    }

    if (pauseMode) {
        return;
    }

    for(let j = 0; j < antsAmount; ++j){
    
        if(!ants[j].food){

            if(antMap.field[ants[j].position[0]][ants[j].position[1]].food > 0){
                ants[j].takeFood();
                ants[j].path = [ants[j].position];
            }
    
            else{
                ants[j].move();
            }
        }

        else{

            if(antMap.field[ants[j].position[0]][ants[j].position[1]].home === true){
                ants[j].dropFood();
                ants[j].path = [ants[j].position];
            }
    
            else{
                ants[j].move();
            }
        }
    }

    antMap.reduceFeromones();

    requestAnimationFrame(makeSimulationStep);
}

createNewField();