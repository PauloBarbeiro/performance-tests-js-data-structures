"use strict"
import { faker } from "@faker-js/faker";

// USER

export function fakeUser(){
    return {
        id: faker.datatype.uuid(),
        username: faker.internet.userName(),
        email: faker.internet.email(),
        avatar: faker.image.avatar(),
        password: faker.internet.password(),
        birthdate: faker.date.birthdate(),
        registeredAt: faker.date.past(),
    }
}

export function userIntoMap(){
    const {id, ...rest} = fakeUser()
    return {
        [id]: { ...rest }
    };
}

export function getUserMapWith(length) {
    return Array.from({length}).reduce((map)=>{
        return {
            ...map,
            ...userIntoMap()
        }
    }, {})
}

// PRODUCTS

export function fakeProduct(){
    const label = faker.finance.amount()
    return {
        id: faker.datatype.uuid(),
        name: faker.commerce.product(),
        label,
        price: +label,
    }
}

export function productIntoMap(withPredefinedId = undefined){
    const { id, ...rest } = fakeProduct()
    const finalId = withPredefinedId ? withPredefinedId : id
    return {
        [finalId]: { ...rest }
    };
}

export function getProductMapWith(length, withPredefinedIds = undefined) {
    return Array.from({length}).reduce((map, _, index)=>{
        return {
            ...map,
            ...productIntoMap(withPredefinedIds?.[index])
        }
    }, {})
}

export function getProductsVariationsMap(length, variations = 0, withPredefinedIds = undefined,withSubData = false) {
    const originalMap = getProductMapWith(length, withPredefinedIds)
    const ids = Object.keys(originalMap)
    const mapResult = {
        0: originalMap
    }
    let variationsResult = [0]
    if(variations) {
        Array.from({length: variations}).forEach((_, idx) => {
            const variation = idx+1
            variationsResult.push(variation)
            const newVarMap = ids.reduce((map, id) => {
                const original = originalMap[id]
                const label = faker.finance.amount()
                return {
                    ...map,
                    [id]: {
                        ...original,
                        label,
                        price: +label
                    }
                }
            }, {})

            mapResult[variation] = {...newVarMap}
        })
    }

    return withSubData
        ? [mapResult, ids, variationsResult]
        : mapResult
}

export function getArrayOfIds(length){
    return Array.from({ length }).map(() => faker.datatype.uuid())
}

/**
 * Will return the following structure
 * {
 *     [layer: string]: {
 *         [variation: number]: {
 *             [id: string]: Product
 *         }
 *     }
 * }
 * @param layersQtd
 * @param length
 * @param variations
 */
export function getMultiLayerProducts(layersQtd = 1, length, variations = 0) {
    const result = {}
    const layers = getArrayOfIds(layersQtd)
    let variationsResult;
    let idsResult;
    layers.forEach(l => {
        const [ map, ids, vars ] = getProductsVariationsMap(length, variations, idsResult, true)

        if( variationsResult === undefined ) {
            variationsResult = vars
        }

        if( idsResult === undefined ) {
            idsResult = ids
        }

        result[l] = {
            ...map,
        }
    })

    return [result, layers, variationsResult, idsResult]
}