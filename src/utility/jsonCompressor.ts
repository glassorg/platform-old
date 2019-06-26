
function getLength(jsonValue) {
    if (jsonValue == null) {
        return 4
    }
    let type = typeof jsonValue
    if (type === "boolean") {
        return jsonValue ? 4 : 5
    }
    if (type === "string") {
        return jsonValue.length + 2
    }
    else {
        return jsonValue.toString().length
    }
}

const objectSuffix = 0
const arraySuffix = 1

class Counter {

    value: any
    count: number
    length: number

    constructor(value) {
        this.value = value
        this.length = getLength(value)
        this.count = 0
    }

    mustIndex(indexSize) {
        // we must index any non-negative integers < indexSize
        return typeof this.value === "number" && Math.floor(this.value) === this.value && this.value < indexSize
    }

    get saveLength() {
        return this.getSaveLength(1)
    }

    getSaveLength(indexLength: number) {
        // if there's only 1 then it doesn't save space to index
        return (this.count - 1) * (this.length - indexLength) - 1
    }

    toString() {
        return `${this.saveLength} : ${this.count} : ${this.length} : ${JSON.stringify(this.value)}`
    }

}

export function compress(json) {
    let count = new Map<any, Counter>()

    function buildCounts(value) {
        if (Array.isArray(value)) {
            for (let element of value) {
                buildCounts(element)
            }
        } else if (value && typeof value === "object") {
            for (let key in value) {
                buildCounts(key)
                buildCounts(value[key])
            }
        } else {
            let counter = count.get(value)
            if (counter == null) {
                count.set(value, counter = new Counter(value))
            }
            counter.count++
        }
    }

    buildCounts(json)

    function getIndexLength(index) {
        return 1 + Math.floor(Math.log10(index))
    }

    // now let's sort by save length.
    let counters = Array.from(count.values()).sort((a,b) => b.saveLength - a.saveLength)
    // remove trailing counters that won't save space based on current index length
    let before = counters.length
    for (let i = counters.length - 1; i >= 0; i--) {
        let counter = counters[i]
        if (counter.getSaveLength(getIndexLength(counters.length)) <= 0) {
            if (!counter.mustIndex(counters.length)) {
                counters.splice(i, 1)
            }
        } else {
            break
        }
    }
    let after = counters.length
    // console.log(`********* REMOVED: ${before - after} from ${before}`)
    // then let's build the index and index lookup
    let indexValues: any[] = []
    let indexLookup = new Map<any, number>()
    for (let counter of counters) {
        if (counter.mustIndex(counters.length) || counter.getSaveLength(getIndexLength(indexValues.length))) {
            indexLookup.set(counter.value, indexValues.length)
            indexValues.push(counter.value)
        }
    }

    // console.log(counters.slice(0, 40).join("\n"))

    function buildOutput(value) {
        if (Array.isArray(value)) {
            let output: any[] = []
            for (let element of value) {
                output.push(buildOutput(element))
            }
            output.push(arraySuffix)
            return output
        } else if (value && typeof value === "object") {
            let output: any[] = []
            for (let key in value) {
                output.push(buildOutput(key))
                output.push(buildOutput(value[key]))
            }
            output.push(objectSuffix)
            return output
        } else {
            let indexedValue = indexLookup.get(value)
            return indexedValue != null ? indexedValue : value
        }
    }

    //  the output is just going to be the indexes with the actual value
    //  being the final element
    let output = indexValues
    indexValues.push(buildOutput(json))

    // console.log(indexValues[indexValues.length - 1])

    return indexValues

    // return json
}

export function decompress(indexedValues) {

    let compressedValue = indexedValues.pop()

    function rebuildInput(value) {
        if (value != null && typeof value === "object") {
            let type = value.pop()
            if (type === arraySuffix) {
                //  modify the array right in place and then return it
                for (let i = 0; i < value.length; i++) {
                    value[i] = rebuildInput(value[i])
                }
            } else {
                //  recreate an object
                let object: any = {}
                for (let i = 0; i < value.length; i += 2) {
                    object[rebuildInput(value[i])] = rebuildInput(value[i+1])
                }
                value = object
            }
        } else {
            let isIndex = typeof value === "number" && value >= 0 && value < indexedValues.length && (value - Math.floor(value)) === 0
            if (isIndex) {
                value = indexedValues[value]
            }
        }
        return value
    }

    let result = rebuildInput(compressedValue)
    // console.log("******** RESULT: ", result)
    return result
}