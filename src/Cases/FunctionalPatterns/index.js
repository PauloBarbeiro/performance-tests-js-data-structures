"use strict"
import { run, bench, group, baseline } from 'mitata';

import {
    executeNestedLoops,
    executePipedSelectorsLodash,
    executePipedMonoidsLodash,
    preparePipedSelectorsLodash,
    preparePipedMonoidsLodash,
    executePipedSelectorsCustom,
    executePipedMonoidsCustom,
    preparePipedSelectorsCustom,
    preparePipedMonoidsCustom,
    executeNestedLoopsGetterFunc,
    executeNestedLoopsClosureGetter,
    executeNestedLoopsClosureChainedGetter,
    executeNestedLoopsLodashGetter,
} from "../../index.js"

/**
 * Goal: measure accessing data strategies for nested structures
 *
 * Collect a sum of all products
 */

export default async function(state, dataSet) {
    const withMethodPipedSelectorsLodash = preparePipedSelectorsLodash(dataSet.firstLayer, dataSet.secondLayer, dataSet.thirdLayer)
    const withMethodMonoidsLodash = preparePipedMonoidsLodash(dataSet.firstLayer, dataSet.secondLayer, dataSet.thirdLayer)
    const withMethodPipedSelectorsCustom = preparePipedSelectorsCustom(dataSet.firstLayer, dataSet.secondLayer, dataSet.thirdLayer)
    const withMethodMonoidsCustom = preparePipedMonoidsCustom(dataSet.firstLayer, dataSet.secondLayer, dataSet.thirdLayer)

    group('Different Basic Loops methods', () => {
        // baseline('fake base', () => Array.from({length: 10}));
        baseline('Simplest', () => executeNestedLoops(state, dataSet.firstLayer, dataSet.secondLayer, dataSet.thirdLayer));
        bench('Simple Getter', () => executeNestedLoopsGetterFunc(state, dataSet.firstLayer, dataSet.secondLayer, dataSet.thirdLayer));
        bench('Closure Getter', () => executeNestedLoopsClosureGetter(state, dataSet.firstLayer, dataSet.secondLayer, dataSet.thirdLayer));
        bench('Closure Chained Getter', () => executeNestedLoopsClosureChainedGetter(state, dataSet.firstLayer, dataSet.secondLayer, dataSet.thirdLayer));
        bench('Lodash Getter', () => executeNestedLoopsLodashGetter(state, dataSet.firstLayer, dataSet.secondLayer, dataSet.thirdLayer));
    });

    group('Different methods with Medium Set (mounting flow)', () => {
        // baseline('fake base', () => Array.from({length: 10}));
        baseline('Basic Loops', () => executeNestedLoops(state, dataSet.firstLayer, dataSet.secondLayer, dataSet.thirdLayer));
        bench('Piped Loops (Lodash)', () => executePipedSelectorsLodash(state, dataSet.firstLayer, dataSet.secondLayer, dataSet.thirdLayer));
        bench('Piped Loops (Custom)', () => executePipedSelectorsCustom(state, dataSet.firstLayer, dataSet.secondLayer, dataSet.thirdLayer));
        bench('Piped Monoids (Lodash)', () => executePipedMonoidsLodash(state, dataSet.firstLayer, dataSet.secondLayer, dataSet.thirdLayer));
        bench('Piped Monoids (Custom)', () => executePipedMonoidsCustom(state, dataSet.firstLayer, dataSet.secondLayer, dataSet.thirdLayer));
    });

    group('Different methods with Medium Set (flow pre-processed )', () => {
        // baseline('fake base', () => Array.from({length: 10}));
        baseline('Basic Loops', () => executeNestedLoops(state, dataSet.firstLayer, dataSet.secondLayer, dataSet.thirdLayer));
        bench('Piped Loops (Lodash)', () => withMethodPipedSelectorsLodash(state));
        bench('Piped Loops (Custom)', () => withMethodPipedSelectorsCustom(state));
        bench('Piped Monoids (Lodash)', () => withMethodMonoidsLodash(state));
        bench('Piped Monoids (Custom)', () => withMethodMonoidsCustom(state));
    });

    group('Pre-mounted Piped Selectors Lodash vs. Custom', () => {
        baseline('Piped Loops (Lodash)', () => withMethodPipedSelectorsLodash(state));
        bench('Piped Loops (Custom)', () => withMethodPipedSelectorsCustom(state));
    });

    group('Pre-mounted Piped Monoids Lodash vs. Custom', () => {
        baseline('Piped Monoids (Lodash)', () => withMethodMonoidsLodash(state));
        bench('Piped Monoids (Custom)', () => withMethodMonoidsCustom(state));
    });


    await run({
        avg: true, // enable/disable avg column (default: true)
        json: false, // enable/disable json output (default: false)
        colors: true, // enable/disable colors (default: true)
        min_max: true, // enable/disable min/max column (default: true)
        collect: false, // enable/disable collecting returned values into an array during the benchmark (default: false)
        percentiles: false, // enable/disable percentiles column (default: true)
    });
}