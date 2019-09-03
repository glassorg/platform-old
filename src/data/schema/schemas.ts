import { Schema, InputArguments } from "./Schema";
import Context from "../../ui/Context";
import Key from "../Key";
import Input, { InputType, InputProperties } from "../../ui/html/components/Input";
import { formatPhoneNumberUSA } from "../../utility/phone";
import Model from "../Model";

function renderInput(c: Context, props: InputArguments, type: InputType) {
    let { id, schema, value, oncancel, onconfirm } = props
    let { name, required, validate, validateFailMessage } = schema
    let inputProperties: InputProperties = {
        type,
        id,
        name,
        required,
        validate,
        validateFailMessage,
        oncancel,
        onconfirm,
        autocomplete: false
    }
    if (props.value) {
        inputProperties.value = value
    }
    if (props.focus) {
        inputProperties.autofocus = true
    }
    if (props.select) {
        inputProperties.autoselect = true
    }
    if (schema.description || schema.patternDescription) {
        inputProperties.title = schema.description || schema.patternDescription
    }
    if (schema.pattern) {
        inputProperties.pattern = schema.pattern.source
    }
    Input(inputProperties)
}

export const object: Schema = {
    type: "object"
}

export const array: Schema = {
    type: "array"
}

export const boolean: Schema = {
    type: "boolean"
}

export const string: Schema = {
    type: "string",
    createInput(c: Context, props) {
        renderInput(c, props, "text")
    },
    coerce(value) {
        return `${value}`.trim()
    }
}

export const number: Schema = {
    type: "number",
    createInput(c: Context, props) {
        renderInput(c, props, "number")
    }
}

export const integer: Schema = {
    type: "number",
    createInput(c: Context, props) {
        renderInput(c, props, "number")
    }
}

export const name: Schema = {
    ...string,
    title: "Name"
}

export const password: Schema = {
    ...string,
    title: "Password",
    createInput(c: Context, props) {
        renderInput(c, props, "password")
    }
}

export const phone: Schema = {
    ...string,
    format: "phone",
    pattern: /\+\d \(\d{3}\) \d{3}-\d{4}/,
    minLength: 8,
    maxLength: 20,
    createInput(c: Context, props) {
        renderInput(c, props, "tel")
    },
    coerce: formatPhoneNumberUSA
}

export const date: Schema = {
    ...string,
    format: "date",
    pattern: /^\d{4}-(0[1-9]|10|11|12)-(0[1-9]|[1-2][0-9]|30|31)$/,
    createInput(c: Context, props) {
        renderInput(c, props, "date")
    }
}

export const datetime: Schema = {
    ...number,
    format: "date-time",
    // pattern: /^\d{4}-(0[1-9]|10|11|12)-(0[1-9]|[1-2][0-9]|30|31)T(([0-1][0-9]|2[0-3]):[0-5][0-9]:[0-9][0-9](\.[0-9]{1,3}Z?)?)|24:00:00$/,
    coerce(value) {
        if (typeof value === "string") {
            value = Date.parse(value)
        }
        return value
    },
    createInput(c: Context, props) {
        renderInput(c, props, "datetime-local")
    }
}

export const email: Schema = {
    ...string,
    title: "Email",
    format: "email",
    pattern: /^[^@]+@[^@\.]+(\.[^@\.]+)+$/,
    patternDescription: "name@address.com",
    maxLength: 200,
    createInput(c: Context, props) {
        renderInput(c, props, "email")
    }
}

export const key: Schema = {
    format: "key",
    type: Key,
    pattern: Key.regex,
    coerce(value) {
        if (typeof value === "string") {
            value = Key.parse(Model.serializer.namespace, value)
        }
        return value
    }
}
