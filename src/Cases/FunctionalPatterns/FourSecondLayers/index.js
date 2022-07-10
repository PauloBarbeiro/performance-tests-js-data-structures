"use strict"
import FS from "fs"
import { fileURLToPath } from 'url'
import Path, { dirname } from "path"

import Benchmark from '../index.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const datasetPath = Path.resolve(__dirname, '../../../DataSource')

const state = JSON.parse(FS.readFileSync(`${datasetPath}/dataset.json`, { flag: 'r' }))
const stateFirstLayer = JSON.parse(FS.readFileSync(`${datasetPath}/layers.json`, { flag: 'r' }))
const stateSecondLayer = JSON.parse(FS.readFileSync(`${datasetPath}/variations.json`, { flag: 'r' }))
const stateThirdLayer = JSON.parse(FS.readFileSync(`${datasetPath}/ids.json`, { flag: 'r' }))

const base = 10

const firstLayer = [stateFirstLayer[0]]
const secondLayer = stateSecondLayer.slice(0,2)

const baselineSet = {
    firstLayer,
    secondLayer,
    thirdLayer: stateThirdLayer.slice(0, base*3)
}

const smallSet = {
    firstLayer,
    secondLayer,
    thirdLayer: stateThirdLayer.slice(0, base*9)
}

const mediumSet = {
    firstLayer,
    secondLayer,
    thirdLayer: stateThirdLayer.slice(0, base*35)
}

const largeSet = {
    firstLayer,
    secondLayer,
    thirdLayer: stateThirdLayer.slice(0, base*75)
}

Benchmark(state, largeSet)