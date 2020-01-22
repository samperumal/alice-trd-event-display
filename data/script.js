function getDigitsLoadUrl(eventNo, sector, stack) { return `data/pPb/${eventNo}.${sector}.${stack}.json`; }

async function getDataAsync() {
    const data = await d3.json('data/sample.json');
    console.log(data);
    return data;
}