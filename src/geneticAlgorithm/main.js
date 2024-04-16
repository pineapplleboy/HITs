class Node{

    constructor(x,y){
        this.x = x;
        this.y = y;
    }
}

let nodes = [];
let nodesCount = 0;
let adjacencyMatrix = [];

let lifeCycleIsActive = false;
let geneicAlgorithmIsActive = false;
let canvasIsEmpty = true;

const canvasPoints = document.getElementById("canvasPoints");
const contextPoints = canvasPoints.getContext("2d");

const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");
canvasPoints.width = canvas.width = 500;
canvasPoints.height = canvas.height = 500;

const mouse = {
    x: 0,
    y: 0,
    over: false,
}

canvas.addEventListener("mouseenter", mouseenterHandler);
canvas.addEventListener("mousemove", mousemoveHandler);
canvas.addEventListener("mouseleave", mouseleaveHandler);
canvas.addEventListener("mousedown", mousedownHandler);

document.querySelector('#deleteField').onclick = function(){

    if(!geneicAlgorithmIsActive){
        clearCanvas();
    }

    geneicAlgorithmIsActive = false;
    canvasIsEmpty = true;
}

document.querySelector('#startGeneticAlgorithm').onclick = function(){
    startGeneticAlgorithm();
}

function mouseenterHandler(event){
    mouse.over = true;
}

function mousemoveHandler(event){
    const rect = canvas.getBoundingClientRect()
    mouse.x = event.clientX - rect.left
    mouse.y = event.clientY - rect.top
}

function mouseleaveHandler(event){
    mouse.over = false;
}

function mousedownHandler(event){
    
    canvasIsEmpty = false;
    geneicAlgorithmIsActive = false;
    
    contextPoints.beginPath();
    contextPoints.arc(mouse.x, mouse.y, 5, 0, Math.PI * 2);
    contextPoints.fillStyle = "black";
    contextPoints.fill();
    nodes[nodesCount] = new Node(mouse.x, mouse.y);
    nodesCount++;
}

function getRandomInt(min, max) {
    const minCeiled = Math.ceil(min);
    const maxFloored = Math.floor(max);
    return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled);
}

function startGeneticAlgorithm(){

    geneicAlgorithmIsActive = true;
    
    //Создаём матрицу смежности с текущими вершинами
    adjacencyMatrix = [nodesCount]
    for(let i = 0; i < nodesCount; ++i){
        adjacencyMatrix[i] = [nodesCount];
    }

    for(let i = 0; i < nodesCount; ++i){
        for(let j = i + 1; j < nodesCount; ++j){

            adjacencyMatrix[i][j] = Math.sqrt((nodes[i].x - nodes[j].x) ** 2 + (nodes[i].y - nodes[j].y) ** 2);
            adjacencyMatrix[j][i] = adjacencyMatrix[i][j];
        }
    }

    let individualsAmount = 400;

    //Создаём случайное первое поколение, сортируем и выводим лучшую особь
    let paths = [individualsAmount];
    let pathSize = [individualsAmount];

    paths = createFirstPopulation(individualsAmount);
    for(let i = 0; i < individualsAmount; ++i){
        
        pathSize[i] = findPathSize(paths[i]);
    }

    sortPopulationWithIndPriority(paths, pathSize, 0, individualsAmount - 1);
    setPathOnScreen(paths[0]);

    let iteration = 0;
    
    function animate() {

        if (iteration >= 10000) {
            geneicAlgorithmIsActive = false;
            return;
        }
    
        let newPopulation = lifeCycle(paths, pathSize, individualsAmount, pathSize[0]);
        paths = newPopulation.newPopulation;
        pathSize = newPopulation.newIndPriority;
        console.log(pathSize[0]);
        iteration++;
        if(geneicAlgorithmIsActive){
            //setTimeout(runLifeCycle);
            requestAnimationFrame(animate);
        }
    }
    
    animate();
}

//Сортировка популяции в порядке возрастания длинны пути коммивояжёра
function sortPopulationWithIndPriority(population, indPriority, l, r) {

	let pivot; let i, j;
	pivot = indPriority[getRandomInt(0, (r - l) + l)];
	i = l; j = r;

	while (i < j)
	{
		while (indPriority[i] < pivot) ++i;
		while (indPriority[j] > pivot) --j;
		if (i <= j) {

            [indPriority[i], indPriority[j]] = [indPriority[j], indPriority[i]];
            [population[i], population[j]] = [population[j], population[i]];
			++i;
			--j;
		}
	}

	if (l < j) sortPopulationWithIndPriority(population, indPriority, l, j);
	if (i < r) sortPopulationWithIndPriority(population, indPriority, i, r);
}

function clearCanvas(){
    nodesCount = 0;
    nodes = [];
    canvas.width = canvas.width;
    canvasPoints.width = canvasPoints.width;
}

function lifeCycle(population, indPriority, indAmount, prevPath){

    if(!geneicAlgorithmIsActive){

        if(canvasIsEmpty){
            clearCanvas();
        }

        return { population, indPriority };
    }

    let pairs = [2];
    pairs[0] = getRandomInt(0, indAmount);
    pairs[1] = getRandomInt(0, indAmount);

    while(pairs[0] === pairs[1]){
        pairs[1] = getRandomInt(1, indAmount);
    }

    //Создаём новую популяцию, первую половину заполняем лучшими особями старого поколения
    let newPopulation = [indAmount];
    let newIndPriority = [indAmount];
    for(let i = 0; i < indAmount; ++i){

        newPopulation[i] = population[i];
        newIndPriority[i] = indPriority[i];
    }

    let newChildren = createChildren(population[pairs[0]], population[pairs[1]]);
    newPopulation[indAmount - 2] = newChildren[0];
    newPopulation[indAmount - 1] = newChildren[1];

    newIndPriority[indAmount - 2] = findPathSize(newPopulation[indAmount - 2]);
    newIndPriority[indAmount - 1] = findPathSize(newPopulation[indAmount - 1]);

    //Сортируем новую популяцию
    sortPopulationWithIndPriority(newPopulation, newIndPriority, 0, indAmount - 1);

    //Если длина пути лучшей особи изменилась, отрисовываем новый путь
    if(prevPath > newIndPriority[0]){
        
        setPathOnScreen(newPopulation[0]);
    }
    
    return { newPopulation, newIndPriority };
}

function setPathOnScreen(path){

    canvas.width = canvas.width;

    context.beginPath();
    for(let i = 0; i < nodesCount + 1; ++i){
        context.lineTo(nodes[path[i]].x, nodes[path[i]].y);
    }
    context.stroke();
}

function setMutation(ind){

    if(getRandomInt(0,100) < 40){

        let firstGen = getRandomInt(1, nodesCount);
            let secondGen = getRandomInt(1, nodesCount);
            while(nodesCount != 1 && nodesCount != 2 && firstGen === secondGen){
                secondGen = getRandomInt(1, nodesCount);
            }
    
            let c = ind[firstGen];
            ind[firstGen] = ind[secondGen];
            ind[secondGen] = c;
    }
}

function createChildren(firstInd, secondInd){

    splitPoint = getRandomInt(1, nodesCount - 1);
    let firstChild = [nodesCount + 1];
    let secondChild = [nodesCount + 1];
    
    let firstChildUsedGens = [nodesCount].fill(false);
    let secondChildUsedGens = [nodesCount].fill(false);

    for(let i = 0; i < splitPoint + 1; ++i){

        firstChild[i] = firstInd[i];
        secondChild[i] = secondInd[i];

        firstChildUsedGens[firstChild[i]] = true;
        secondChildUsedGens[secondChild[i]] = true;
    }

    let currSecIndGen = splitPoint + 1;
    let currFirIndGen = splitPoint + 1;
    for(let i = splitPoint + 1; i < nodesCount; ++i){
        
        while(currSecIndGen < nodesCount && firstChildUsedGens[secondInd[currSecIndGen]]){
            currSecIndGen++;
        }

        if(currSecIndGen < nodesCount){
            
            firstChildUsedGens[secondInd[currSecIndGen]] = true;
            firstChild[i] = secondInd[currSecIndGen];
        }
        
        else{

            while(firstChildUsedGens[firstInd[currFirIndGen]]){
                currFirIndGen++;
            }
            firstChild[i] = firstInd[currFirIndGen];
            firstChildUsedGens[firstInd[currFirIndGen]] = true;
        }
    }

    currSecIndGen = splitPoint + 1;
    currFirIndGen = splitPoint + 1;
    for(let i = splitPoint + 1; i < nodesCount; ++i){
        
        while(currFirIndGen < nodesCount && secondChildUsedGens[firstInd[currFirIndGen]]){
            currFirIndGen++;
        }

        if(currFirIndGen < nodesCount){
            
            secondChildUsedGens[firstInd[currFirIndGen]] = true;
            secondChild[i] = firstInd[currFirIndGen];
        }
        
        else{

            while(secondChildUsedGens[secondInd[currSecIndGen]]){
                currSecIndGen++;
            }
            secondChild[i] = secondInd[currSecIndGen];
            secondChildUsedGens[secondInd[currSecIndGen]] = true;
        }
    }
    
    firstChild[nodesCount] = firstChild[0];
    secondChild[nodesCount] = secondChild[0];

    setMutation(firstChild);
    setMutation(secondChild);

    let res = [2];
    res[0] = firstChild;
    res[1] = secondChild;
    return res;
}

function createFirstPopulation(indAmount){

    let path = [nodesCount + 1].fill(0);
    path[0] = path[nodesCount] = 0;
    
    let usedID = [nodesCount + 1].fill(false);
    for(let i = 1; i < nodesCount; ++i){

        let pathToNearestNeighbour = 100000000;
        let nearestNeighbourID;

        for(let j = 1; j < nodesCount; ++j){
            if(adjacencyMatrix[path[i - 1]][j] < pathToNearestNeighbour && !usedID[j]){
                pathToNearestNeighbour = adjacencyMatrix[path[i - 1]][j];
                nearestNeighbourID = j;
            }
        }

        path[i] = nearestNeighbourID;
        usedID[nearestNeighbourID] = true;
    }

    let population = [indAmount];
    population[0] = path;
    let sdvig = 1;
    for(let i = 1; i < indAmount; ++i){

        population[i] = [nodesCount + 1];

        for(let j = 0; j < nodesCount; ++j){
            population[i][(j + sdvig) % (nodesCount)] = population[0][j];
        }

        population[i][nodesCount] = population[i][0];   
        sdvig = (sdvig < nodesCount) ? sdvig + 1: 0;
    }
    return population;
}

function findPathSize(path){

    let ans = 0;

    for(let i = 0; i < nodesCount; ++i){

        ans += adjacencyMatrix[path[i]][path[i + 1]];
    }

    return ans;
}