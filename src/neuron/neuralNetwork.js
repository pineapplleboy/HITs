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
            const data = filename;
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
}

