
import { isPlainObject } from "../utility/common";
import Model from "./Model";
import { getValue } from "./schema/functions";

const ops = {
    "!=": (a, b) => a != b,
    "=" : (a, b) => a == b,
    ">" : (a, b) => a > b,
    "<" : (a, b) => a < b,
    ">=": (a, b) => a >= b,
    "<=": (a, b) => a <= b,
}

type Ascending = true
type Descending = false
type Primitive = string | number | boolean | null
type Query<T = Model> = {
    offset?: number
    limit?: number
    where?: {
        [property: string]: Primitive | { [p in keyof typeof ops]?: Primitive }
    }
    sort?: Array<{ [property: string]: Ascending | Descending }>
}

export function createPredicate<T>(query: Query<T>) {
    return function(model: T) {
        let where = query.where
        if (where != null) {
            for (let name in where) {
                let value = where[name]
                if (isPlainObject(value)) {
                    for (let op in value as any) {
                        if (!ops[op](model[name], value))
                            return false;
                    }
                } else {
                    if (!ops["="](model[name], value))
                        return false
                }
            }
        }
        return true
    }
}

function compare(a, b) {
    if (a === b)
        return 0
    if (a == null)
        return -1
    if (b == null)
        return 1
    if (a.constructor !== b.constructor) {
        a = a.constructor.name
        b = b.constructor.name
    }
    return a < b ? -1 : +1
}

export function createSortCompareFunction<T extends Model>(query: Query<T>): (a: T, b: T) => number {
    return (a: T, b: T) => {
        if (query.sort) {
            for (let sort of query.sort) {
                for (let property in sort) {
                    let direction = sort[property]
                    let order = compare(getValue(a, property), getValue(b, property))
                    if (order !== 0) {
                        return direction ? order : -order
                    }
                }
            }
        }
        return 0
    }
}

export function isQuery<T = Model>(value): value is Query<T> {
    return isPlainObject(value) && (value.offset || value.limit || value.where || value.sort)
}

export default Query
