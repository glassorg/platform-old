import test from "ava";
import Context from "../../Context";
import { JSDOM } from "jsdom";
import Form from "./Form";

test("Form", t => {
    let dom = new JSDOM("<html><head></head><body></body></html>")
    let body = dom.window.document.body
    let context = new Context(body)
    context.beginRender(body)
    context.render(Form, { descriptor: { properties: [{ name: "foo", title: "Foo" }] } })
    context.endRender()
    let names = [...body.querySelectorAll("input")].map(e => e.id)
    t.deepEqual(names, ["foo"])
    console.log(body.innerHTML)
})