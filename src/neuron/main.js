const nn = new NeuralNetwork();
document.addEventListener("DOMContentLoaded", function() {
    fetch('/src/neuron/weights.json')
        .then(response => response.json())
        .then(data => {
            console.log('File loaded successfully');
            nn.loadWeightsAndBiasesFromFile(data);
        })
        .catch(error => {
            console.error('Failed to load file:', error);
        });
});

    const canvas = document.getElementById('drawing-board');
    const ctx = canvas.getContext('2d');

    canvas.width = 500;
    canvas.height = 500;

    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const w = 50;
    const h = 50;
    const scale = canvas.width / w;

    let mousePressed = 0;
    let colors = new Array(w).fill(0).map(() => new Array(h).fill(0));

    canvas.addEventListener('mousedown', (e) => {
        mousePressed = 1;
        draw(e);
    });

    canvas.addEventListener('mouseup', () => {
        mousePressed = 0;
    });

    canvas.addEventListener('mousemove', (e) => {
        if (mousePressed) {
            draw(e);
        }
    });

    document.getElementById('clear').addEventListener('click', () => {
        clearCanvas();
    });

    document.getElementById('recognize').addEventListener('click', () => {
        centerDigit();
        recognizeDrawing();
    });

    function draw(e) {
        const brushSize = 20;
        const rect = canvas.getBoundingClientRect();

        const mouseX = Math.floor((e.clientX - rect.left) / scale) * 500 / rect.width;
        const mouseY = Math.floor((e.clientY - rect.top) / scale) * 500 / rect.height;

        if (mousePressed !== 0) {
            for (let i = -brushSize; i <= brushSize; i++) {
                for (let j = -brushSize; j <= brushSize; j++) {
                    const currentX = Math.floor((mouseX + i));
                    const currentY = Math.floor((mouseY + j));

                    if (currentX >= 0 && currentX < w && currentY >= 0 && currentY < h) {
                        const distToCenter = Math.sqrt(i * i + j * j);
                        let dist = distToCenter * distToCenter;
                        if (dist < 1) dist = 1;
                        dist *= dist;

                        if (mousePressed === 1) colors[currentY][currentX] += 1 / dist;
                        else colors[currentY][currentX] -= 0.1 / dist;
                        if (colors[currentY][currentX] > 1) colors[currentY][currentX] = 1;
                        if (colors[currentY][currentX] < 0) colors[currentY][currentX] = 0;
                        if (colors[currentY][currentX] * 255 < 1) colors[currentY][currentX] = 0;
                    }
                }
            }
            drawCanvas();
        }
    }

    function drawCanvas() {
        const ctx = canvas.getContext('2d');

        for (let j = 0; j < h; j++) {
            for (let i = 0; i < w; i++) {
                const color = Math.floor(colors[j][i] * 255);
                ctx.fillStyle = `rgb(${color},${color},${color})`;
                ctx.fillRect(i * scale, j * scale, scale, scale);
            }
        }
    }

    function clearCanvas() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        colors = new Array(w).fill(0).map(() => new Array(h).fill(0));
        document.getElementById('result').innerText = '';
    }
    function centerDigit() {
        let minX = w;
        let maxX = 0;
        let minY = h;
        let maxY = 0;

        for (let j = 0; j < h; j++) {
            for (let i = 0; i < w; i++) {
                if (colors[j][i] > 0) {
                    minX = Math.min(minX, i);
                    maxX = Math.max(maxX, i);
                    minY = Math.min(minY, j);
                    maxY = Math.max(maxY, j);
                }
            }
        }

        const centerX = 50 / 2;
        const centerY = 50 / 2;

        const digitWidth = (maxX - minX + 1);
        const digitHeight = (maxY - minY + 1);

        const offsetX = centerX - Math.floor(digitWidth / 2) - minX;
        const offsetY = centerY - Math.floor(digitHeight / 2) - minY;
        console.log(digitWidth / 2, digitHeight / 2)
        const centeredColors = new Array(w).fill(0).map(() => new Array(h).fill(0));

        for (let j = minY; j <= maxY; j++) {
            for (let i = minX; i <= maxX; i++) {
                const newX = i + offsetX;
                const newY = j + offsetY;
                if (newX >= 0 && newX < w && newY >= 0 && newY < h) {
                    centeredColors[newY][newX] = colors[j][i];
                }
            }
        }

        colors = centeredColors;

        //drawCanvas();
    }

    function recognizeDrawing() {
    const allDigits = document.querySelectorAll('.digit');
    allDigits.forEach(digit => {
        digit.style.color = '';
    });

    const brightnessValues = colors.map(row => row.map(val => Math.round(val * 255)));

    let output = nn.feedForward(flattenColorsArray(brightnessValues));
    let sortedOutput = output.slice().sort((a, b) => b - a);
    let maxIndices = [];
    for (let i = 0; i < 3; i++) {
        let maxVal = sortedOutput[i];
        let index = output.indexOf(maxVal);
        maxIndices.push(index);
        output[index] = -Infinity;
    }
    const highlightColors = ['green', 'yellow', 'red'];
    const digitBlocks = document.querySelectorAll('.digit');
    maxIndices.forEach((index, i) => {
            digitBlocks[index].style.color = highlightColors[i];
        });
    //saveDrawnDigitsDataToCSV();
}

    function flattenColorsArray(colors) {
        let pixels = [];
        for (let row of colors) {
            pixels.push(...row);
        }
        return pixels;
    }
    
const dialog = document.querySelector("dialog");

document.querySelector("#infoButton").onclick = function() {
    dialog.showModal();
}

document.querySelector("#closeDialog").onclick = function() {
    dialog.close();
}

window.sessionStorage.setItem("slide", 5); // на какой слайд возвращаемся

document.querySelector("#backButton").onclick = function() {
    window.location.href = "../sliderMenu";
}
