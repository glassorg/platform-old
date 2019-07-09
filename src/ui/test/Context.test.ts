import test from "ava"
import Context from "../Context"
import { JSDOM } from "jsdom"
import html from "../html"

function Row(c: Context, index: number) {
    c.begin(html.div)
        c.text(`Test ${index}`)
    c.end(html.div)
}

function Empty(c: Context, index: number) {
}

test("TestRender", t => {
    let dom = new JSDOM("<html><head></head><body></body></html>")
    let body = dom.window.document.body
    let context = new Context(body)
    context.beginRender(body)
    for (let i = 0; i < 4; i++) {
        context.render(Row, i)
    }
    context.endRender()
    t.deepEqual(body.outerHTML, "<body><div>Test 0</div><div>Test 1</div><div>Test 2</div><div>Test 3</div></body>")
})

test("Error on empty render", t => {
    let dom = new JSDOM("<html><head></head><body></body></html>")
    let body = dom.window.document.body
    let context = new Context(body)
    t.throws(() => {
        // rendering nothing should throw an error
        context.beginRender(body)
        context.render(Empty, 0)
        context.endRender()
    })
})
