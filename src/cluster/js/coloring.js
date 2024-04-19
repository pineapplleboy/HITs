export function getRandomColor(usedColors) {
    let color;
    const maxAttempts = 100;
    let attempts = 0;

    do {
        color = `rgb(${getRandomRGBValue()}, ${getRandomRGBValue()}, ${getRandomRGBValue()})`;
        attempts++;
    } while (usedColors.has(color) || isColorTooClose(color, usedColors) || attempts < maxAttempts);

    usedColors.add(color);
    return color;
}

function isColorTooClose(newColor, usedColors) {
    const threshold = 50;
    for (const usedColor of usedColors) {
        if (calculateColorDistance(newColor, usedColor) < threshold) {
            return true;
        }
    }
    return false;
}

function calculateColorDistance(color1, color2) {
    const [r1, g1, b1] = color1.match(/\d+/g).map(Number);
    const [r2, g2, b2] = color2.match(/\d+/g).map(Number);
    return Math.sqrt((r1 - r2) ** 2 + (g1 - g2) ** 2 + (b1 - b2) ** 2);
}

function getRandomRGBValue() {
    return Math.floor(Math.random() * 254);
}


