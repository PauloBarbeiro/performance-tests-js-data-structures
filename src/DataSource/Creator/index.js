"use strict"
import FS from "fs"
import { fileURLToPath } from 'url'
import Path, { dirname } from "path"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

import { getMultiLayerProducts } from '../../Fakers/index.js'

const baseTargetFolder = Path.resolve(__dirname, '../')

const numberOfProducts = +process.env.RECORDS
const numberOfLayers = +process.env.LAYERS
const numberOfVariations = +process.env.VARIATIONS

console.log('Number of Products  : ', numberOfProducts)
console.log('Number of Layers    : ', numberOfLayers)
console.log('Number of Variations: ', numberOfVariations)
console.log('   Total data points: ', numberOfProducts * numberOfLayers * numberOfVariations)
console.log('   Data saved in    : ', baseTargetFolder)

const stats = {
number_products  : numberOfProducts,
number_layers    : numberOfLayers,
number_variations: numberOfVariations,
total_data_points: numberOfProducts * numberOfLayers * numberOfVariations,
data_saved_in    : baseTargetFolder,
}

const structure = getMultiLayerProducts(numberOfLayers, numberOfProducts, numberOfVariations)

const [map, layers, variations, ids] = structure

FS.writeFileSync(`${baseTargetFolder}/dataset_statistics.json`, JSON.stringify(stats))
FS.writeFileSync(`${baseTargetFolder}/dataset.json`, JSON.stringify(map))
FS.writeFileSync(`${baseTargetFolder}/layers.json`, JSON.stringify(layers))
FS.writeFileSync(`${baseTargetFolder}/variations.json`, JSON.stringify(variations))
FS.writeFileSync(`${baseTargetFolder}/ids.json`, JSON.stringify(ids))
