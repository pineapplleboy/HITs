class Node{

    constructor(x,y){
        this.x = x
        this.y = y
    }
}

let nodes = []
let nodesCount = 0
let adjacencyMatrix = []

const canvas = document.querySelector("canvas")
const context = canvas.getContext("2d")

canvas.width = 500
canvas.height = 500

const mouse = {
    x: 0,
    y: 0,
    over: false,
}

canvas.addEventListener("mouseenter", mouseenterHandler)
canvas.addEventListener("mousemove", mousemoveHandler)
canvas.addEventListener("mouseleave", mouseleaveHandler)
canvas.addEventListener("mousedown", mousedownHandler)

function mouseenterHandler(event){
    mouse.over = true
}

function mousemoveHandler(event){
    const rect = canvas.getBoundingClientRect()
    mouse.x = event.clientX - rect.left
    mouse.y = event.clientY - rect.top
}

function mouseleaveHandler(event){
    mouse.over = false
}

function mousedownHandler(event){
    if(event.buttons === 2){
        startGeneticAlgorithm()
    }
    else if(mouse.over){
        context.beginPath()
        context.arc(mouse.x, mouse.y, 5, 0, Math.PI * 2);
        context.fill()
        nodes[nodesCount] = new Node(mouse.x, mouse.y)
        nodesCount++
    }
}

function getRandomInt(min, max) {
    const minCeiled = Math.ceil(min)
    const maxFloored = Math.floor(max)
    return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled)
}

function startGeneticAlgorithm(){

    //Создаём матрицу смежности с текущими вершинами
    adjacencyMatrix = [nodesCount]
    for(let i = 0; i < nodesCount; ++i){
        adjacencyMatrix[i] = [nodesCount]
    }

    for(let i = 0; i < nodesCount; ++i){
        for(let j = i + 1; j < nodesCount; ++j){

            adjacencyMatrix[i][j] = Math.sqrt((nodes[i].x - nodes[j].x) ** 2 + (nodes[i].y - nodes[j].y) ** 2);
            adjacencyMatrix[j][i] = adjacencyMatrix[i][j];
        }
    }

    let individualsAmount = 800;

    //Создаём случайное первое поколение, сортируем и выводим лучшую особь
    let paths = [individualsAmount];
    let pathSize = [individualsAmount];

    for(let i = 0; i < individualsAmount; ++i){
        paths[i] = createRandomPath();
        pathSize[i] = findPathSize(paths[i]);
    }

    let sorted = sortPopulationWithIndPriority(paths, pathSize);
    paths = sorted.newPopulation;
    pathSize = sorted.newIndPriority;
    setPathOnScreen(paths[0]);

    //Запускаем жизненный цикл 400 раз
    for(let i = 0; i < 400; ++i){
        
        let newPopulation = lifeCycle(paths, pathSize, 800, pathSize[0]);
        paths = newPopulation.newPopulation;
        pathSize = newPopulation.newIndPriority;
        //console.log(paths);
        //console.log(pathSize);
    }
}

//Сортировка популяции в порядке возрастания длинны пути коммивояжёра
function sortPopulationWithIndPriority(newPopulation, newIndPriority) {

    let indexes = Array.from(newIndPriority.keys());

    indexes.sort((a, b) => newIndPriority[a] - newIndPriority[b]);

    const sortedPopulation = [];

    for (let index of indexes) {
        sortedPopulation.push(newPopulation[index]);
    }

    return { newPopulation: sortedPopulation, newIndPriority: newIndPriority.sort() };
}

function lifeCycle(population, indPriority, indAmount, prevPath){

    //Случайным образом выбираем порядок генов для создания пар особей
    let pairs = [indAmount];
    let usedInds = [indAmount].fill(false);

    for(let i  = 0; i < indAmount / 2; ++i){

        pairs[i] = getRandomInt(0, indAmount / 2);

        while(usedInds[pairs[i]]){
            pairs[i] = getRandomInt(0, indAmount / 2);
        }
        usedInds[pairs[i]] = true;
    }

    //Создаём новую популяцию, первую половину заполняем лучшими особями старого поколения
    let newPopulation = [indAmount];
    let newIndPriority = [indAmount];
    for(let i = 0; i < indAmount / 2; ++i){

        newPopulation[i] = population[i];
        newIndPriority[i] = indPriority[i];
    }

    //Вторую половину новой популяции заполняем детьми ранее созданных пар
    for(let i = 0; i < indAmount / 4; ++i){

        let newChildren = createChildren(population[pairs[i * 2]], population[pairs[i * 2 + 1]]);

        newPopulation[i * 2 + indAmount / 2] = newChildren[0];
        newPopulation[i * 2 + indAmount / 2 + 1] = newChildren[1];

        newIndPriority[i * 2 + indAmount / 2] = findPathSize(newPopulation[i * 2 + indAmount / 2]);
        newIndPriority[i * 2 + indAmount / 2 + 1] = findPathSize(newPopulation[i * 2 + indAmount / 2 + 1]);
    }

    //Сортируем новую популяцию
    let sorted = sortPopulationWithIndPriority(newPopulation, newIndPriority);
    newPopulation = sorted.newPopulation;

    //console.log(population);
    //console.log(newPopulation);
    //Если длина пути лучшей особи изменилась, отрисовываем новый путь
    if(prevPath != newIndPriority[0]){
        
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

    if(getRandomInt(0,100) < 30){

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

    firstChild[0] = 0;
    firstChild[nodesCount] = 0;
    secondChild[0] = 0;
    secondChild[nodesCount] = 0;
    
    let firstChildUsedGens = [nodesCount].fill(false);
    let secondChildUsedGens = [nodesCount].fill(false);

    for(let i = 1; i < splitPoint + 1; ++i){

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
    
    setMutation(firstChild);
    setMutation(secondChild);
    let res = [2];
    res[0] = firstChild;
    res[1] = secondChild;
    return res;
}

function createRandomPath(){

    let path = [nodesCount + 1].fill(0);
    path[0] = path[nodesCount] = 0;
    
    let usedID = [nodesCount + 1].fill(false);
    for(let i = 1; i < nodesCount; ++i){

        path[i] = getRandomInt(1, nodesCount);

        while(usedID[path[i]]){
            path[i] = getRandomInt(1, nodesCount);
        }
        usedID[path[i]] = true;
    }

    return path;
}

function findPathSize(path){

    let ans = 0

    for(let i = 0; i < nodesCount; ++i){
        ans += adjacencyMatrix[path[i]][path[i + 1]]
    }

    return ans
}