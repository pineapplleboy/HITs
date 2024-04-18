
//import * as fs from "fs";
//const {readFileSync, createWriteStream} = require("fs");

class Layer {
    constructor(size, nextSize = 0) {
        this.size = size;
        this.neurons = new Array(size).fill(0);
        this.biases = new Array(size);
        for (let i = 0; i < size; i++) {
            this.biases[i] = Math.random() * 2.0 - 1.0;
        }
        this.weights = this.createArray(size, nextSize);
    }

    createArray(rows, columns) {
        let array = new Array(rows);
        for (let i = 0; i < rows; i++) {
            array[i] = new Array(columns);
            for (let j = 0; j < columns; j++) {
                array[i][j] = Math.random() * 2.0 - 1.0;
            }
        }
        return array;
    }
}

class NeuralNetwork {
    input;
    output;
    hidden;
    secondHid;
    constructor(inputNum = 2500, hiddenNum = 512, secondHidNum = 512, outputNum = 10) {
        this.inputNum = inputNum;
        this.hiddenNum = hiddenNum;
        this.secondhidNum = secondHidNum;
        this.outputNum = outputNum;

        this.input = new Layer(inputNum, hiddenNum);
        this.hidden = new Layer(hiddenNum, secondHidNum);
        this.secondHid = new Layer(secondHidNum, outputNum);
        this.output = new Layer(outputNum);
    }
    loadWeightsAndBiasesFromFile(filename) {
        try {
            const data = JSON.parse(filename);
            this.input.weights = data.input.weights;
            this.hidden.weights = data.hidden.weights;
            this.hidden.biases = data.hidden.biases;
            this.secondHid.weights = data.secondHid.weights;
            this.secondHid.biases = data.secondHid.biases;
            this.output.biases = data.output.biases;
            console.log(`Weights and biases loaded`);
            console.log(this.hidden.weights);
        } catch (error) {
            console.error('Error loading weights and biases:', error);
        }
    }


    saveWeightsAndBiasesToFile(filename) {
        const data = {
            input: {
                weights: this.input.weights,
            },
            hidden: {
                weights: this.hidden.weights,
                biases: this.hidden.biases
            },
            secondHid: {
                weights: this.secondHid.weights,
                biases: this.secondHid.biases
            },
            output: {
                biases: this.output.biases
            }
        };
        const jsonData = JSON.stringify(data, null, 2);
        const fs = require('fs');
        fs.writeFileSync(filename, jsonData);
        console.log(`Weights and biases saved to ${filename}`);
    }

    feedForward(input) {
        function ReLU(activation) {
            if (activation > 0){
                return activation;
            }
            else {
                return 0;
            }
        }
        function sigmoid(x) {
            return 1 / (1 + Math.exp(-x));
        }

        for (let i = 0; i < this.hiddenNum; i++) {
            this.hidden.neurons[i] = 0;
            for (let j = 0; j < this.inputNum; j++) {
                this.hidden.neurons[i] += input[j] * this.input.weights[j][i];
            }
            this.hidden.neurons[i] += this.hidden.biases[i];
            this.hidden.neurons[i] = sigmoid(this.hidden.neurons[i]);
        }


        for (let i = 0; i < this.secondhidNum; i++) {
            this.secondHid.neurons[i] = 0;
            for (let j = 0; j < this.hiddenNum; j++) {
                this.secondHid.neurons[i] += this.hidden.neurons[j] * this.hidden.weights[j][i];
            }
            this.secondHid.neurons[i] += this.secondHid.biases[i];
            this.secondHid.neurons[i] = sigmoid(this.secondHid.neurons[i]);
        }

        for (let i = 0; i < this.outputNum; i++) {
            this.output.neurons[i] = 0;
            for (let j = 0; j < this.secondhidNum; j++) {
                this.output.neurons[i] += this.secondHid.neurons[j] * this.secondHid.weights[j][i];
            }
            this.output.neurons[i] += this.output.biases[i];
            this.output.neurons[i] = sigmoid(this.output.neurons[i]);
        }
        return this.output.neurons;
    }

    backpropagation(targets, learningRate = 0.03) {
        let outputErrors = new Array(this.outputNum);
        let outputGradients = new Array(this.outputNum);
        for (let i = 0; i < this.outputNum; i++) {
            outputErrors[i] = targets[i] - this.output.neurons[i];
            outputGradients[i] = outputErrors[i] * this.output.neurons[i] * (1 - this.output.neurons[i]);
        }

        for (let i = 0; i < this.outputNum; i++) {
            for (let j = 0; j < this.secondhidNum; j++) {
                this.secondHid.weights[j][i] += outputGradients[i] * this.secondHid.neurons[j] * learningRate;
            }
            this.output.biases[i] += outputGradients[i] * learningRate;
        }

        let secHiddenErrors = new Array(this.secondhidNum);
        let secHiddenGradients = new Array(this.secondhidNum);
        for (let i = 0; i < this.secondhidNum; i++) {
            secHiddenErrors[i] = 0;
            for (let j = 0; j < this.outputNum; j++) {
                secHiddenErrors[i] += outputErrors[j] * this.secondHid.weights[i][j];
                secHiddenGradients[i] = secHiddenErrors[i] * this.secondHid.neurons[i] * (1 - this.secondHid.neurons[i]);
            }
        }

        for (let i = 0; i < this.secondhidNum; i++) {
            for (let j = 0; j < this.hiddenNum; j++) {
                this.hidden.weights[j][i] += secHiddenGradients[i] * this.hidden.neurons[j] * learningRate;
            }
            this.secondHid.biases[i] += secHiddenGradients[i] * learningRate;
        }

        let hiddenErrors = new Array(this.hiddenNum);
        let hiddenGradients = new Array(this.hiddenNum);
        for (let i = 0; i < this.hiddenNum; i++) {
            hiddenErrors[i] = 0;
            for (let j = 0; j < this.secondhidNum; j++) {
                hiddenErrors[i] += secHiddenErrors[j] * this.hidden.weights[i][j];
                hiddenGradients[i] = hiddenErrors[i] * this.hidden.neurons[i] * (1 - this.hidden.neurons[i]);
            }
        }

        for (let i = 0; i < this.hiddenNum; i++) {
            for (let j = 0; j < this.inputNum; j++) {
                this.input.weights[j][i] += hiddenGradients[i] * this.input.neurons[j] * learningRate;
            }
            this.hidden.biases[i] += hiddenGradients[i] * learningRate;
        }
    }
    checkNeuron(mnistData) {
        const samples = mnistData.length - 100;
        let counter = 0;
        for (let i = 0; i < 200; i++) {
            let imgIndex = Math.floor(Math.random() * samples);
            let outputs = this.feedForward(mnistData[imgIndex].input);
            let maxDigit = 0;
            let maxDigitWeight = -1;
            for (let k = 0; k < 10; k++) {
                if (outputs[k] > maxDigitWeight) {
                    maxDigitWeight = outputs[k];
                    maxDigit = k;
                }
            }
            if (mnistData[imgIndex].target === maxDigit){
                counter++;
            }
        }
    }
}
function digits(mnistData) {
    const nn = new NeuralNetwork();

    const samples = mnistData.length;
    let imgIndex = 0;
    const epochs = 601;
    for (let i = 1; i <= epochs; i++) {
        let right = 0;
        let errorSum = 0;
        const batchSize = 100;
        for (let j = 0; j < batchSize; j++) {
            let targets = new Array(10).fill(0);
            let digit = mnistData[imgIndex].target;
            targets[digit] = 1;
            let outputs = nn.feedForward(mnistData[imgIndex].input);
            imgIndex++;
            let maxDigit = 0;
            let maxDigitWeight = -1;
            for (let k = 0; k < 10; k++) {
                if (outputs[k] > maxDigitWeight) {
                    maxDigitWeight = outputs[k];
                    maxDigit = k;
                }
            }
            if (digit === maxDigit) right++;
            for (let k = 0; k < 10; k++) {
                errorSum += Math.pow((targets[k] - outputs[k]), 2);
            }
            nn.backpropagation(targets);
        }
        console.log(`epoch: ${i}. correct: ${right}. error: ${errorSum}`);
    }
    nn.saveWeightsAndBiasesToFile('./weights.json');
}

function readMNISTFileTrain(filename) {
    const rawData = readFileSync(filename, 'utf-8');
    const lines = rawData.split('\n');

    const data = lines.map(line => {
        const values = line.split(',').map(val => Number(val) / 255);
        const label = values.shift() * 255;
        return { input: values, target: label };
    });

    return data;
}
const fs = require('fs');
function processMNISTTestFile() {
    const data = [];
    const outputFile = "mnist_test_50_50.csv";
    const outputFileStream = fs.createWriteStream(outputFile);

    const csvWriter = (row) => {
        let x2_train = row[0] + ",";
        row = row.slice(1);
        for (let i = 0; i < 28; i++) {
            let row1 = "";
            for (let j = 0; j < 28; j++) {
                row1 += row[j + 28 * i] + ",";
                if ((j + 1) % 4 !== 0 || (j + 1) % 16 === 0) {
                    row1 += row[j + 28 * i] + ",";
                }
            }
            x2_train += row1;
            if ((i + 1) % 4 !== 0 || (i + 1) % 16 === 0) {
                x2_train += row1;
            }
        }
        outputFileStream.write(x2_train.slice(0, -1) + "\n");
    };

    const rawData = fs.readFileSync('mnist_train.csv', 'utf-8');
    const lines = rawData.split('\n');

    for (const line of lines) {
        const row = line.split(',').map(Number);
        data.push(row);
    }

    data.forEach(csvWriter);
    outputFileStream.end();
}

//processMNISTTestFile();

const mnistData = readMNISTFileTrain('./mnist_test_50_50.csv');
digits(mnistData);

