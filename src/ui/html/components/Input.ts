import Context from "../../Context";
import Model from "../../../data/Model";
import Key from "../../../data/Key";
import FocusState from "../../../model/FocusState";
import State from "../../../data/State";
import { getAncestorForm, getFormValues } from "../../../ui/html/functions";
import * as html from "../";

const canSelect: { [type: string]: boolean } = {
    text: true,
    textarea: true,
    password: true,
    url: true,
    search: true
}

@Model.class()
export class InputState extends State {

    @Model.property({ type: "string", default: "" })
    value!: string

}

export type InputType = "text" | "textarea" | "password" | "number" | "email" | "url" | "tel" | "search" | "datetime-local" | "date"
export type InputProperties = {
    id: string,
    name?: string,
    title?: string,
    class?: string,
    value?: string,
    type?: InputType,
    style?: string,
    pattern?: string,
    autocomplete?: boolean,
    autofocus?: boolean,
    autoselect?: boolean,
    placeholder?: string,
    required?: boolean,
    validate?: (value: string, form: HTMLFormElement) => boolean,
    validateFailMessage?: string,
    onkeyup?: (this: HTMLInputElement, e: KeyboardEvent) => void,
    onclick?: (this: HTMLInputElement, e: MouseEvent) => void,
    onfocus?: (this: HTMLInputElement, e: FocusEvent) => void,
    oninput?: (this: HTMLInputElement, e: KeyboardEvent) => void,
    onchange?: (this: HTMLInputElement, e: KeyboardEvent) => void,
    onkeydown?: (this: HTMLInputElement, e: KeyboardEvent) => void,
    onkeypress?: (this: HTMLInputElement, e: KeyboardEvent) => void,
    oncancel?: (this: HTMLInputElement, e: KeyboardEvent) => void,
    onconfirm?: (this: HTMLInputElement, e: KeyboardEvent) => void,
}

export default Context.component((c: Context, p: InputProperties) => {
    let {
        id,
        value,
        type = "text",
        name,
        title,
        class: className,
        style,
        pattern,
        autocomplete,
        autoselect,
        placeholder,
        required,
        validateFailMessage: string,
        onkeyup,
        onclick,
        onfocus,
        oninput,
        onchange,
        onkeydown,
        onkeypress,
        onconfirm,
        oncancel
        } = p
    let key = Key.create(InputState, id)
    let focusState = c.store.peek(FocusState.key)
    let inputState = c.store.peek(key)
    if (value == null) {
        value = inputState.value
    }
    function saveState(input: HTMLInputElement) {
        c.store.patch(FocusState.key, { id, start: input.selectionStart, end: input.selectionEnd, direction: input.selectionDirection as any })
        c.store.patch(key, { value: input.value })
    }
    function maybeRestoreStateOnFocus(input: HTMLInputElement) {
        if (focusState.id === id && canSelect[type]) {
            input.selectionStart = focusState.start
            input.selectionEnd = focusState.end
            input.selectionDirection = focusState.direction
        }
        c.store.patch(FocusState.key, { id })
    }
    let props: any = {
        type: type === "textarea" ? undefined : type,
        id, value, name, title, class: className,
        style, pattern, autocomplete, placeholder, required,
        autofocus: focusState.id === id,
        onkeydown(this: HTMLInputElement, e: KeyboardEvent) {
            if (onkeydown) {
                onkeydown.call(this, e)
            }
            if (e.key === "Enter") {
                if (onconfirm) {
                    onconfirm.call(this, e)
                }
            }
            if (e.key === "Escape") {
                if (oncancel) {
                    oncancel.call(this, e)
                }
            }
        },
        onkeypress,
        onchange,
        oninput(this: HTMLInputElement, e: KeyboardEvent) {
            if (oninput) {
                oninput.call(this, e)
            }
            if (validate) {
                validate()
            }
        },
        onclick(this: HTMLInputElement, e: MouseEvent) {
            saveState(this)
            if (onclick) {
                onclick.call(this, e)
            }
        },
        onkeyup(this: HTMLInputElement, e: KeyboardEvent) {
            saveState(this)
            if (onkeyup) {
                onkeyup.call(this, e)
            }
        },
        onfocus(this: HTMLInputElement, e: FocusEvent) {
            maybeRestoreStateOnFocus(this)
            if (onfocus) {
                onfocus.call(this, e)
            }
        }
    }
    if (p.pattern) {
        props.pattern = p.pattern
    }
    if (p.autocomplete != null) {
        props.autocomplete = p.autocomplete ? "on" : "off"
    }
    let element: HTMLInputElement | HTMLTextAreaElement
    if (type === "textarea") {
        element = c.begin(html.textarea, props)
        if (value != null) {
            c.text(value)
        }
        c.end(html.textarea)
    } else {
        element = c.empty(html.input, props)
    }

    if (p.autofocus && element.focus) {
        element.focus()
    }
    if (p.autoselect && element.select) {
        element.select()
    }

    let validate = p.validate ? function() {
        let form = getAncestorForm(element)
        if (form) {
            let formValues = getFormValues(form)
            let value = element.value
            let valid = p.validate!.call(formValues, value, form)
            console.log('form onchange validate: ' + valid)
            element.setCustomValidity(
                valid
                ? ""
                : (p.validateFailMessage || "Failed custom validation")
            )
        }
    } : null

    // validate on render in case we are reloading the page, because then change won't be called
    if (validate) {
        validate()
        //  we also have to listen to other form change events
        //  since our validation may depend on them, such as in password confirm
        let form = getAncestorForm(element)
        if (form) {
            form.addEventListener("input", (e) => {
                console.log("form.input", e)
            })
            form.addEventListener("change", (e) => {
                console.log("form.change", e)
            })
            form.addEventListener("change", validate)
            return () => form!.removeEventListener("change", validate!)
        }
    } else {
        return
    }
})
