
type Operations<T> = {
    add(...values: T[]): T
    subtract(a: T, b: T): T
    scale(a: T, b: number): T
}

const NumberOperations: Operations<number> = {
    add(...values) {
        let total = 0
        for (let value of values) {
            total += value
        }
        return total
    },
    subtract(a, b) {
        return a - b
    },
    scale(a, b) {
        return a * b
    }
}

const InstanceOperations: Operations<any> = {
    add(...values) {
        let total = values[0]
        for (let i = 1; i < values.length; i++) {
            total = total.add(values[i])
        }
        return total
    },
    subtract(a, b) {
        return a.subtract(b)
    },
    scale(a, b) {
        return a.scale(b)
    }
}

export function getOperations(type) {
    return type === Number ? NumberOperations : InstanceOperations
}

export default Operations
