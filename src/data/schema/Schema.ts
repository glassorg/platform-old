import Context from "../../ui/Context";
import { FieldArguments } from "../../ui/html/components/Field";

export type Properties = { [name: string]: Schema | undefined }
export type Class = { prototype: object }
export type Type = "string" | "object" | "array" | "null" | "boolean" | "number" | "integer" | Class
export type InputArguments = {
    id: string
    schema: Schema
    focus?: boolean
    select?: boolean
    value?: any
    oncancel?: (e: Event) => void
    onconfirm?: (e: Event) => void
}

export type Schema = {
    title?: string
    description?: string
    oneOf?: Schema[]
    anyOf?: Schema[]
    allOf?: Schema[]
    not?: Schema
    const?: any
    type?: Type | Type[]
    format?: string
    enum?: any[]
    maximum?: number
    minimum?: number
    maxLength?: number
    minLength?: number
    pattern?: RegExp
    patternDescription?: string
    items?: Schema | Schema[]
    minItems?: number
    maxItems?: number
    uniqueItems?: boolean
    contains?: Schema
    additionalItems?: Schema
    properties?: Properties
    patternProperties?: Properties
    minProperties?: number
    additionalProperties?: Schema

    name?: string
    index?: boolean
    visible?: boolean
    editable?: boolean
    required?: boolean
    coerce?(this: any, value): any
    validate?(this: any, value): any
    validateFailMessage?: string
    default?: any
    createInput?: (c: Context, props: InputArguments) => void
}
