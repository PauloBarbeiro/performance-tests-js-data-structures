"use strict"
import FS from "fs"
import { fileURLToPath } from 'url'
import Path, { dirname } from "path"
import flow from "lodash/flow.js";
import { run, bench, group, baseline } from 'mitata';

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const datasetPath = Path.resolve(__dirname, '../../../DataSource')

const state = JSON.parse(FS.readFileSync(`${datasetPath}/dataset.json`, { flag: 'r' }))
const stateFirstLayer = JSON.parse(FS.readFileSync(`${datasetPath}/layers.json`, { flag: 'r' }))
const stateSecondLayer = JSON.parse(FS.readFileSync(`${datasetPath}/variations.json`, { flag: 'r' }))
const stateThirdLayer = JSON.parse(FS.readFileSync(`${datasetPath}/ids.json`, { flag: 'r' }))

const base = 10

const baselineSet = {
    firstLayer: [stateFirstLayer[0]],
    secondLayer: stateSecondLayer.slice(0,2),
    thirdLayer: stateThirdLayer.slice(0, base*3)
}

const smallSet = {
    firstLayer: [stateFirstLayer[0]],
    secondLayer: stateSecondLayer.slice(0,2),
    thirdLayer: stateThirdLayer.slice(0, base*9)
}

const mediumSet = {
    firstLayer: [stateFirstLayer[0]],
    secondLayer: stateSecondLayer.slice(0,2),
    thirdLayer: stateThirdLayer.slice(0, base*35)
}

/**
 * Goal: measure accessing data strategies for nested structures
 *
 * Collect a sum of all products
 */

function operationsWithMethodLoops(_state, _firstLayer, _secondLayer, _thirdLayer){
    const data = {
        latestSum: 0,
        pastSum: 0,
        latestAverage: 0,
        pastAverage: 0,
        latestCount: 0,
        pastCount: 0,
        diff: 0
    }

    _firstLayer.forEach(first => {
        const firstLevelData = _state[first]
        _secondLayer.forEach(second => {
            const secondLevelData = firstLevelData[second]
            _thirdLayer.forEach(third => {
                const thirdLevelData = secondLevelData[third]
                data.latestSum += thirdLevelData.price
            })
        })
    })

    return {
        ...data,
        latestAverage: data.latestSum / data.latestCount || 1,
        pastAverage: data.pastSum / data.pastCount || 1,
        diff: data.latestSum - data.pastSum
    }
}

function sumXInStorage(storage) {
    return (x) => storage.latestCount += x;
}

function getPrice(object) {
    return object.price;
}

function getFirstLayer(id) {
    return (map) => map[id];
}

function getSecondLayer(id) {
    return (map) => map[id];
}

function getThirdLayer(id) {
    return (map) => map[id];
}

function operationsWithMethodPipedSelectors(_state, _firstLayer, _secondLayer, _thirdLayer){
    const data = {
        latestSum: 0,
        pastSum: 0,
        latestAverage: 0,
        pastAverage: 0,
        latestCount: 0,
        pastCount: 0,
        diff: 0
    }
    const sumPrice = sumXInStorage(data)

    const functions = []

    _firstLayer.forEach((f) => {
        _secondLayer.forEach((s) => {
            _thirdLayer.forEach((t) => {
                functions.push([
                    getFirstLayer(f),
                    getSecondLayer(s),
                    getThirdLayer(t),
                    getPrice,
                    sumPrice
                ]);
            });
        });
    });

    functions.forEach((fx) => {
        flow(fx)(_state);
    });

    return {
        ...data,
        latestAverage: data.latestSum / data.latestCount || 1,
        pastAverage: data.pastSum / data.pastCount || 1,
        diff: data.latestSum - data.pastSum
    }
}

function rail(func, isFirstInChain = false) {
    return ([state, pre]) => {
        const x = func(isFirstInChain ? state : pre);
        return [state, x];
    };
}

function getter(key) {
    return (obj) => {
        return obj && obj[key] ? obj[key] : obj;
    };
}

function fx(key, isFirstInChain = false) {
    return rail(getter(key), isFirstInChain);
}

function fLog() {
    return rail((s) => {
        console.log('---------\n',s)
        return s
    });
}

function fz(func) {
    return rail(func);
}

function operationsWithMethodMonoids(_state, _firstLayer, _secondLayer, _thirdLayer){
    const data = {
        latestSum: 0,
        pastSum: 0,
        latestAverage: 0,
        pastAverage: 0,
        latestCount: 0,
        pastCount: 0,
        diff: 0
    }

    function calculator(storage) {
        return function (value) {
            storage.latestSum += value;
        };
    }

    const sumFunc = calculator(data);

    const functions = []

    _firstLayer.forEach((first) => {
        _secondLayer.forEach((second) => {
            _thirdLayer.forEach((third) => {
                functions.push(fx(first, true));
                functions.push(fx(second));
                functions.push(fx(third));
                functions.push(fx('price'));
                functions.push(fz(sumFunc));
                // functions.push(fLog());
            });
        });
    });

    const monoidPipe = flow(functions)
    monoidPipe([state])

    return {
        ...data,
        latestAverage: data.latestSum / data.latestCount || 1,
        pastAverage: data.pastSum / data.pastCount || 1,
        diff: data.latestSum - data.pastSum
    }
}


function prepareFlow(_firstLayer, _secondLayer, _thirdLayer){
    const data = {
        latestSum: 0,
        pastSum: 0,
        latestAverage: 0,
        pastAverage: 0,
        latestCount: 0,
        pastCount: 0,
        diff: 0
    }
    const sumPrice = sumXInStorage(data)

    const functions = []

    _firstLayer.forEach((f) => {
        _secondLayer.forEach((s) => {
            _thirdLayer.forEach((t) => {
                functions.push([
                    getFirstLayer(f),
                    getSecondLayer(s),
                    getThirdLayer(t),
                    getPrice,
                    sumPrice
                ]);
            });
        });
    });



    return (_state) => {
        functions.forEach((fx) => {
            flow(fx)(_state);
        });

        return {
            ...data,
            latestAverage: data.latestSum / data.latestCount || 1,
            pastAverage: data.pastSum / data.pastCount || 1,
            diff: data.latestSum - data.pastSum
        }
    }
}


function prepareMonoids(_firstLayer, _secondLayer, _thirdLayer){
    const data = {
        latestSum: 0,
        pastSum: 0,
        latestAverage: 0,
        pastAverage: 0,
        latestCount: 0,
        pastCount: 0,
        diff: 0
    }

    function calculator(storage) {
        return function (value) {
            storage.latestSum += value;
        };
    }

    const sumFunc = calculator(data);

    const functions = []

    _firstLayer.forEach((first) => {
        _secondLayer.forEach((second) => {
            _thirdLayer.forEach((third) => {
                functions.push(fx(first, true));
                functions.push(fx(second));
                functions.push(fx(third));
                functions.push(fx('price'));
                functions.push(fz(sumFunc));
                // functions.push(fLog());
            });
        });
    });

    const monoidPipe = flow(functions)

    return (_state) => {
        monoidPipe([state])

        return {
            ...data,
            latestAverage: data.latestSum / data.latestCount || 1,
            pastAverage: data.pastSum / data.pastCount || 1,
            diff: data.latestSum - data.pastSum
        }
    }
}

const withMethodPipedSelectors = prepareFlow(mediumSet.firstLayer, mediumSet.secondLayer, mediumSet.thirdLayer)
const withMethodMonoids = prepareMonoids(mediumSet.firstLayer, mediumSet.secondLayer, mediumSet.thirdLayer)

group('Baseline Range', () => {
    // baseline('fake base', () => Array.from({length: 10}));
    baseline('Minimal Set', () => operationsWithMethodLoops(state, baselineSet.firstLayer, baselineSet.secondLayer, baselineSet.thirdLayer));
    bench('Small Set', () => operationsWithMethodLoops(state, smallSet.firstLayer, smallSet.secondLayer, smallSet.thirdLayer));
    bench('Medium Set', () => operationsWithMethodLoops(state, mediumSet.firstLayer, mediumSet.secondLayer, mediumSet.thirdLayer));
});

group('Different methods with Medium Set (mounting flow)', () => {
    // baseline('fake base', () => Array.from({length: 10}));
    baseline('Basic Loops', () => operationsWithMethodLoops(state, mediumSet.firstLayer, mediumSet.secondLayer, mediumSet.thirdLayer));
    bench('Piped Loops', () => operationsWithMethodPipedSelectors(state, mediumSet.firstLayer, mediumSet.secondLayer, mediumSet.thirdLayer));
    bench('Piped Monoids', () => operationsWithMethodMonoids(state, mediumSet.firstLayer, mediumSet.secondLayer, mediumSet.thirdLayer));
});

group('Different methods with Medium Set (flow pre-processed )', () => {
    // baseline('fake base', () => Array.from({length: 10}));
    baseline('Basic Loops', () => operationsWithMethodLoops(state, mediumSet.firstLayer, mediumSet.secondLayer, mediumSet.thirdLayer));
    bench('Piped Loops', () => withMethodPipedSelectors(state));
    bench('Piped Monoids', () => withMethodMonoids(state));
});

await run({
    avg: true, // enable/disable avg column (default: true)
    json: false, // enable/disable json output (default: false)
    colors: true, // enable/disable colors (default: true)
    min_max: true, // enable/disable min/max column (default: true)
    collect: false, // enable/disable collecting returned values into an array during the benchmark (default: false)
    percentiles: false, // enable/disable percentiles column (default: true)
});
// */