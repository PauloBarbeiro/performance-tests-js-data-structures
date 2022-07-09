"use strict"
import { run, bench, group, baseline } from 'mitata';

import { getProductMapWith } from '../Fakers/index.js'

const base = 10

const products = getProductMapWith(base ** 4)
const keys = Object.keys(products)

function sumPricesMethodLoop(_ids, _products){
    let sum = 0

    _ids.forEach(id=>{
        sum += _products[id].price
    })

    return sum
}

function getPrice(product) {
    return product.price
}

function sumPricesMethodLoopDataAccessor(_ids, _products){
    const data = {
        sum: 0
    }

    _ids.forEach(id=>{
        data.sum += getPrice(_products[id])
    })

    return data.sum
}

function getById(map, id){
    return map[id]
}

function combiner(productsMap, acc){
    return (id) => {
        acc.sum += getPrice(getById(productsMap, id))
    }
}

function sumPricesMethodLoopDataCombiner(_ids, _products){
    const data = {
        sum: 0
    }
    const selector = combiner(_products, data)

    _ids.forEach(selector)

    return data.sum
}

function sumPricesMethodAccumulator(_ids, _products){
    const data = {
        prices: [],
        sum: 0
    }

    _ids.forEach(id=>{
        data.prices.push(_products[id].price)
    })

    return data.prices.reduce((a, b) => a+b, 0)
}



group('group', () => {
    baseline('Simple Loop', () => sumPricesMethodLoop(keys, products));
    baseline('Simple Loop With Accessor', () => sumPricesMethodLoopDataAccessor(keys, products));
    baseline('Simple Loop With Combiner', () => sumPricesMethodLoopDataCombiner(keys, products));
    bench('Accumulator and Sum', () => sumPricesMethodAccumulator(keys, products));
});

await run({
    avg: true, // enable/disable avg column (default: true)
    json: false, // enable/disable json output (default: false)
    colors: true, // enable/disable colors (default: true)
    min_max: true, // enable/disable min/max column (default: true)
    collect: false, // enable/disable collecting returned values into an array during the benchmark (default: false)
    percentiles: false, // enable/disable percentiles column (default: true)
});