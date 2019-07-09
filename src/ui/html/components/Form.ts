import Context from "../../Context";
import { Schema, Properties, getSubSchema } from "../../../data/schema";
import Field, { FieldArguments } from "./Field";
import { getFormValues } from "../../../ui/html/functions";
import Model from "../../../data/Model";
import Key, { ModelKey } from "../../../data/Key";
import invoke from "../../../server/invoke";
import html from "../";

// deliberately compatible with ISchema for a Model
export type FormDescriptor = {
    name?: string
    title?: string
    properties: Array<FieldArguments | FormDescriptor | Schema & { name, title }> | Properties
}

function isFormDescriptor(object): object is FormDescriptor {
    return object && Array.isArray(object.properties)
}

function renderFormFields(c: Context, baseId: string, descriptor: FormDescriptor) {
    for (let index in descriptor.properties) {
        let field = descriptor.properties[index]
        if (isFormDescriptor(field)) {
            renderFormFields(c, baseId, field)
        } else {
            let id = baseId + field.name
            c.render(Field, { id, schema: field })
        }
    }
}

export default function Form(c: Context, props: {
    id?: string
    actionApi?: string
    actionKey?: ModelKey
    descriptor: FormDescriptor
    onsubmit?: (this: HTMLFormElement, values) => void
    oncomplete?: (this: HTMLFormElement, values) => void
}) {
    let { id, actionApi, actionKey, descriptor, onsubmit, oncomplete } = props
    let baseId = id ? id + "." : ""
    c.begin(html.form, {
        method: "dialog",
        onsubmit(this: HTMLFormElement, e: Event) {
            let values = getFormValues(this)
            if (Model.isClass(descriptor)) {
                values = new descriptor(values)
            }
            if (onsubmit) {
                onsubmit.call(this, values)
            }
            if (actionApi) {
                invoke(actionApi, values).then(result => {
                    if (actionKey) {
                        c.store.patch(actionKey!, result)
                        values = c.store.peek(actionKey)
                    } else {
                        //  if actionApi is specified but no key
                        //  then the result of the actionApi is called
                        //  then the final result is set as values
                        //  to be called back from the onSubmit
                        values = result
                    }
                    if (oncomplete) {
                        oncomplete.call(this, values)
                    }
                })
            }
            else {
                if (oncomplete) {
                    oncomplete.call(this, values)
                }
            }
            //  if we submit by invoking the action on the server
            //  then how does the server respond to us?
            //  ideally... by sending back a command which just changes state
            //  but how to know which state to change?
            //  we could provide a key and it just sends back a patch
        }
    })
        renderFormFields(c, baseId, descriptor)
        c.begin(html.footer)
            c.empty(html.button, { type:"submit" }, "Submit")
        c.end(html.footer)
    c.end(html.form)
}
