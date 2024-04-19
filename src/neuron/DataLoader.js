class DataLoader {
    static shared = new DataLoader();

    constructor() {}

    async loadWeights() {
        try {
            const response = await fetch('./models/weights.json');
            return await response.json();
        } catch (error) {
            throw new Error('Failed to load weights: ' + error.message);
        }
    }
}
async function fetchData() {
    try {
        const loader = DataLoader.shared;
        const result = await loader.loadWeights();
        console.log(result);
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

// Вызываем функцию для загрузки данных
fetchData();