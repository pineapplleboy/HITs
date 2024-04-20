import { readMNISTFile } from "./dataLoader.js";
function digits(mnistData) {
    const nn = new NeuralNetwork();

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


const mnistData = readMNISTFile('./mnist_test_50_50.csv');
digits(mnistData);