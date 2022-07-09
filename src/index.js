"use strict"
import { run, bench, group, baseline } from 'mitata';

import { getProductsVariationsMap } from './Fakers/index.js'

const base = 10

const state = getProductsVariationsMap(base**3, 2)
const keys = Object.keys(state[0])
console.log(keys.length, 'items in total.')
/**
 *  Sums:
 *      - prices latest
 *      - prices past
 *  Diff:
 *      - prices latest - past
 *  Average:
 *      - prices latest
 *      - prices past
 */

function operationsWithMethodLoop(_ids, _products, daysInPast){
    const data = {
        latestSum: 0,
        pastSum: 0,
        latestAverage: 0,
        pastAverage: 0,
        latestCount: 0,
        pastCount: 0,
        diff: 0
    }

    _ids.forEach(id => {
        data.latestSum += _products[0][id].price
        data.pastSum += _products[daysInPast][id].price
        data.latestCount += 1
        data.pastCount += 1
    })

    return {
        ...data,
        latestAverage: data.latestSum / data.latestCount,
        pastAverage: data.pastSum / data.pastCount,
        diff: data.latestSum - data.pastSum
    }
}

function getPrice(product) {
    return product.price
}

function getById(map, id){
    return map[id]
}

function getFromMapBy(criteria){
    return (map) => map[criteria]
}

const getLatest = getFromMapBy(0)
const getPast = getFromMapBy(1)

function operationWithMethodLoopDataAccessor(_ids, _products, daysInPast){
    const data = {
        latestSum: 0,
        pastSum: 0,
        latestAverage: 0,
        pastAverage: 0,
        latestCount: 0,
        pastCount: 0,
        diff: 0
    }

    const latest = getLatest(_products)
    const past = getPast(_products)

    _ids.forEach(id => {
        const latestProduct = getById(latest, id)
        const pastProduct = getById(past, id)
        data.latestSum += getPrice(latestProduct)
        data.pastSum += getPrice(pastProduct)
        data.latestCount += 1
        data.pastCount += 1
    })

    return {
        ...data,
        latestAverage: data.latestSum / data.latestCount,
        pastAverage: data.pastSum / data.pastCount,
        diff: data.latestSum - data.pastSum
    }
}

function combiner(_state, daysInPast, store){
    const latest = _state[0]
    const past = _state[daysInPast]
    return (id, idx) => {
        const latestPrice = getPrice(getById(latest, id))
        const pastPrice = getPrice(getById(past, id))
        store.latestSum += latestPrice
        store.pastSum += pastPrice
        store.latestCount += 1
        store.pastCount += 1
    }
}

function operationWithMethodLoopCombiner(_ids, _products, daysInPast){
    const data = {
        latestSum: 0,
        pastSum: 0,
        latestAverage: 0,
        pastAverage: 0,
        latestCount: 0,
        pastCount: 0,
        diff: 0
    }

    const selector = combiner(_products, daysInPast, data)

    _ids.forEach(selector)

    return {
        ...data,
        latestAverage: data.latestSum / data.latestCount,
        pastAverage: data.pastSum / data.pastCount,
        diff: data.latestSum - data.pastSum
    }
}

const getLatestPriceById = (state) => (id) => state?.[0]?.[id].price
const getPastPriceById = (state, daysInPast) => (id) => state?.[daysInPast]?.[id].price

function combinerTwo(_state, daysInPast, store){
    const getLatest = getLatestPriceById(_state)
    const getPast = getPastPriceById(_state, daysInPast)
    return (id, idx) => {
        const latestPrice = getLatest(id)
        const pastPrice = getPast(id)
        store.latestSum += latestPrice
        store.pastSum += pastPrice
        store.latestCount += 1
        store.pastCount += 1
    }
}

function operationWithMethodLoopSelector(_ids, _products, daysInPast){
    const data = {
        latestSum: 0,
        pastSum: 0,
        latestAverage: 0,
        pastAverage: 0,
        latestCount: 0,
        pastCount: 0,
        diff: 0
    }

    const selector = combinerTwo(_products, daysInPast, data)

    _ids.forEach(selector)

    return {
        ...data,
        latestAverage: data.latestSum / data.latestCount,
        pastAverage: data.pastSum / data.pastCount,
        diff: data.latestSum - data.pastSum
    }
}

group('group', () => {
    baseline('Simple Loop', () => operationsWithMethodLoop(keys, state, 1));
    bench('Simple Loop With Accessor', () => operationWithMethodLoopDataAccessor(keys, state, 1));
    bench('Simple Loop With Combiner', () => operationWithMethodLoopCombiner(keys, state, 1));
    bench('Simple Loop With Selector', () => operationWithMethodLoopSelector(keys, state, 1));
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