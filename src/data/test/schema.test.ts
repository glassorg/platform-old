import test from "ava"
import { traverse } from "../../utility/common"
import { Schema } from "../schema"

const xSchema: Schema = {
    type: "object",
    properties: {
        x: {
            type: "integer"
        }
    },
    additionalProperties: {
        type: "boolean"
    }
}

const schemaArray1: Schema = {
    type: "array",
    items: {
        type: "string"
    }
}

const schemaArray2: Schema = {
    type: "array",
    items: [{
        type: "string"
    }, {
        type: "boolean"
    }],
    additionalItems: {
        type: "integer"
    }
}

function traverseAndGetTypes(root, schema: Schema) {
    let values: any[] = []
    traverse(root, schema, (item, itemSchema, ancestors: any[], path: any[]) => {
        values.push(path[path.length - 1], itemSchema.type, item)
    })
    return values
}

test("schema", t => {
    let xValue = { x: 1, y: false }
    t.deepEqual(traverseAndGetTypes(xValue, xSchema), [undefined, "object", xValue, "x", "integer", 1, "y", "boolean", false])
    let array1 = ["foo", "bar"]
    t.deepEqual(traverseAndGetTypes(array1, schemaArray1), [undefined, "array", array1, 0, "string", "foo", 1, "string", "bar"])
    let array2 = ["foo", true, 12]
    t.deepEqual(traverseAndGetTypes(array2, schemaArray2), [undefined, "array", array2, 0, "string", "foo", 1, "boolean", true, 2, "integer", 12])
})