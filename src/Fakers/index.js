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

export function productIntoMap(){
    const {id, ...rest} = fakeProduct()
    return {
        [id]: { ...rest }
    };
}

export function getProductMapWith(length) {
    return Array.from({length}).reduce((map)=>{
        return {
            ...map,
            ...productIntoMap()
        }
    }, {})
}

export function getProductsVariationsMap(length, variations = 0) {
    const originalMap = getProductMapWith(length)
    const ids = Object.keys(originalMap)
    const result = {
        0: originalMap
    }

    if(variations) {
        Array.from({length: variations}).forEach((v, idx) => {
            const newVarMap = ids.reduce((map, id) => {
                const original = originalMap[id]
                return {
                    ...map,
                    [id]: {
                        ...original,
                        price: original.price + Math.random() * 10
                    }
                }
            }, {})

            result[idx+1] = {...newVarMap}
        })
    }

    return result
}