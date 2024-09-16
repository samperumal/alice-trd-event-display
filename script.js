function getDigitsLoadUrl(eventNo, sector, stack) { 
    return `data/pilotBeampp/${eventNo}.${sector}.${stack}.json`; 
}

async function getDataAsync() {
    const data = await d3.json('data/pilotBeampp/events.json');
    return data;
}