import {DataLoader} from "./DataLoader";
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