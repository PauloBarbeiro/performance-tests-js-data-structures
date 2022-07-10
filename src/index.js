"use strict"
// First functions

import flow from "lodash/flow.js";
import get from "lodash/get.js"

export function sumXInStorage(storage) {
    return (x) => storage.latestCount += x;
}

export function getPrice(object) {
    return object.price;
}

export function getFirstLayer(id) {
    return (map) => map[id];
}

export function getSecondLayer(id) {
    return (map) => map[id];
}

export function getThirdLayer(id) {
    return (map) => map[id];
}

// Monoidal functions

export function rail(func, isFirstInChain = false) {
    return ([state, pre]) => {
        const x = func(isFirstInChain ? state : pre);
        return [state, x];
    };
}

export function getter(key) {
    return (obj) => {
        return obj && obj[key] ? obj[key] : obj;
    };
}

export function fx(key, isFirstInChain = false) {
    return rail(getter(key), isFirstInChain);
}

export function fLog() {
    return rail((s) => {
        console.log('---------\n',s)
        return s
    });
}

export function fz(func) {
    return rail(func);
}

// Functional utilities

export function customPipe(fns){
    return function(x) {
        return fns.reduce((v, fn) => {
            return(fn(v))
        }, x)
    }
}

// Operation Methods For Tests
function getStorageObject() {
    return {
        latestSum: 0,
        pastSum: 0,
        latestAverage: 0,
        pastAverage: 0,
        latestCount: 0,
        pastCount: 0,
        diff: 0
    }
}

function getPriceForSum (state, f, s, t) {
    return state[f][s][t].price
}

function createGetterPriceForSum (state) {
    return (f, s, t) => state[f][s][t].price
}

function createChainedGetterPriceForSum (state) {
    return (f, s, t) => state?.[f]?.[s]?.[t].price ?? 0
}

export function executeNestedLoops(_state, _firstLayer, _secondLayer, _thirdLayer){
    const data = getStorageObject()

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


export function executeNestedLoopsGetterFunc(_state, _firstLayer, _secondLayer, _thirdLayer){
    const data = getStorageObject()

    _firstLayer.forEach(first => {
        _secondLayer.forEach(second => {
            _thirdLayer.forEach(third => {
                data.latestSum += getPriceForSum(_state, first, second, third)
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

export function executeNestedLoopsClosureGetter(_state, _firstLayer, _secondLayer, _thirdLayer){
    const data = getStorageObject()
    const getPrice = createGetterPriceForSum(_state)

    _firstLayer.forEach(first => {
        _secondLayer.forEach(second => {
            _thirdLayer.forEach(third => {
                data.latestSum += getPrice(first, second, third)
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

export function executeNestedLoopsClosureChainedGetter(_state, _firstLayer, _secondLayer, _thirdLayer){
    const data = getStorageObject()
    const getPrice = createChainedGetterPriceForSum(_state)

    _firstLayer.forEach(first => {
        _secondLayer.forEach(second => {
            _thirdLayer.forEach(third => {
                data.latestSum += getPrice(first, second, third)
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

export function executeNestedLoopsLodashGetter(_state, _firstLayer, _secondLayer, _thirdLayer){
    const data = getStorageObject()

    _firstLayer.forEach(first => {
        _secondLayer.forEach(second => {
            _thirdLayer.forEach(third => {
                data.latestSum += get(_state, [first, second, third], 0)
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

// Operations with Lodash

export function executePipedSelectorsLodash(_state, _firstLayer, _secondLayer, _thirdLayer){
    const data = getStorageObject()

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

export function executePipedMonoidsLodash(_state, _firstLayer, _secondLayer, _thirdLayer){
    const data = getStorageObject()

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
    monoidPipe([_state])

    return {
        ...data,
        latestAverage: data.latestSum / data.latestCount || 1,
        pastAverage: data.pastSum / data.pastCount || 1,
        diff: data.latestSum - data.pastSum
    }
}

export function preparePipedSelectorsLodash(_firstLayer, _secondLayer, _thirdLayer){
    const data = getStorageObject()
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

export function preparePipedMonoidsLodash(_firstLayer, _secondLayer, _thirdLayer){
    const data = getStorageObject()

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
        monoidPipe([_state])

        return {
            ...data,
            latestAverage: data.latestSum / data.latestCount || 1,
            pastAverage: data.pastSum / data.pastCount || 1,
            diff: data.latestSum - data.pastSum
        }
    }
}

// Custom Pipe Implementation

export function executePipedSelectorsCustom(_state, _firstLayer, _secondLayer, _thirdLayer){
    const data = getStorageObject()

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

    functions.forEach((fns) => {
        customPipe(fns)(_state);
    });

    return {
        ...data,
        latestAverage: data.latestSum / data.latestCount || 1,
        pastAverage: data.pastSum / data.pastCount || 1,
        diff: data.latestSum - data.pastSum
    }
}

export function executePipedMonoidsCustom(_state, _firstLayer, _secondLayer, _thirdLayer){
    const data = getStorageObject()

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

    const monoidPipe = customPipe(functions)
    monoidPipe([_state])

    return {
        ...data,
        latestAverage: data.latestSum / data.latestCount || 1,
        pastAverage: data.pastSum / data.pastCount || 1,
        diff: data.latestSum - data.pastSum
    }
}

export function preparePipedSelectorsCustom(_firstLayer, _secondLayer, _thirdLayer){
    const data = getStorageObject()
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
            customPipe(fx)(_state);
        });

        return {
            ...data,
            latestAverage: data.latestSum / data.latestCount || 1,
            pastAverage: data.pastSum / data.pastCount || 1,
            diff: data.latestSum - data.pastSum
        }
    }
}

export function preparePipedMonoidsCustom(_firstLayer, _secondLayer, _thirdLayer){
    const data = getStorageObject()

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

    const monoidPipe = customPipe(functions)

    return (_state) => {
        monoidPipe([_state])

        return {
            ...data,
            latestAverage: data.latestSum / data.latestCount || 1,
            pastAverage: data.pastSum / data.pastCount || 1,
            diff: data.latestSum - data.pastSum
        }
    }
}
