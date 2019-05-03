import test from "ava"
import { JSDOM } from "jsdom"
import VirtualNode, { extendElementAsVirtualNodeRoot } from "../VirtualNode";
import INode from "../INode";
let dom = new JSDOM("<html><head></head><body></body></html>")
let document = dom.window.document

class TestNode extends VirtualNode {

    name: string

    constructor(name: string) {
        super()
        this.name = name
    }

    toString() {
        this.name
    }

}

test("VirtualNode properties are initially null", t => {
    let root = new TestNode("root")
    t.true(root.parentNode === null)
    t.true(root.firstChild === null)
    t.true(root.lastChild === null)
    t.true(root.nextSibling === null)
    t.true(root.previousSibling === null)
})
test("appendChild works", t => {
    let root = new TestNode("root")
    let a = new TestNode("a")
    root.appendChild(a)
    t.true(root.firstChild === a)
    t.true(root.lastChild === a)
    t.true(root.parentNode === null)
    t.true(root.nextSibling === null)
    t.true(root.previousSibling === null)

    t.true(a.parentNode === root)
    t.true(a.firstChild === null)
    t.true(a.lastChild === null)
    t.true(a.nextSibling === null)
    t.true(a.previousSibling === null)
})
test("insertBefore(child, null) works", t => {
    let root = new TestNode("root")
    let a = new TestNode("a")
    root.insertBefore(a, null)
    t.true(root.firstChild === a)
    t.true(root.lastChild === a)
    t.true(root.parentNode === null)
    t.true(root.nextSibling === null)
    t.true(root.previousSibling === null)

    t.true(a.parentNode === root)
    t.true(a.firstChild === null)
    t.true(a.lastChild === null)
    t.true(a.nextSibling === null)
    t.true(a.previousSibling === null)
})
test("insertBefore(child) one child works", t => {
    let root = new TestNode("root")
    let a = new TestNode("a")
    root.insertBefore(a, null)
    let b = new TestNode("b")
    root.insertBefore(b, a)
    t.true(root.firstChild === b)
    t.true(root.lastChild === a)
    t.true(root.parentNode === null)
    t.true(root.nextSibling === null)
    t.true(root.previousSibling === null)

    t.true(a.parentNode === root)
    t.true(a.firstChild === null)
    t.true(a.lastChild === null)
    t.true(a.nextSibling === null)
    t.true(a.previousSibling === b)

    t.true(b.parentNode === root)
    t.true(b.firstChild === null)
    t.true(b.lastChild === null)
    t.true(b.nextSibling === a)
    t.true(b.previousSibling === null)
})

test("insertBefore(child, ref) between two children works", t => {
    let root = new TestNode("root")
    let a = new TestNode("a")
    root.appendChild(a)
    let c = new TestNode("c")
    root.appendChild(c)
    let b = new TestNode("b")
    root.insertBefore(b, c)

    t.true(root.firstChild === a)
    t.true(root.lastChild === c)
    t.true(root.parentNode === null)
    t.true(root.nextSibling === null)
    t.true(root.previousSibling === null)

    t.true(a.parentNode === root)
    t.true(a.firstChild === null)
    t.true(a.lastChild === null)
    t.true(a.previousSibling === null)
    t.true(a.nextSibling === b)

    t.true(b.parentNode === root)
    t.true(b.firstChild === null)
    t.true(b.lastChild === null)
    t.true(b.previousSibling === a)
    t.true(b.nextSibling === c)

    t.true(c.parentNode === root)
    t.true(c.firstChild === null)
    t.true(c.lastChild === null)
    t.true(c.previousSibling === b)
    t.true(c.nextSibling === null)

})

test("appendChild three", t => {
    let root = new TestNode("root")
    let a = new TestNode("a")
    root.appendChild(a)
    let b = new TestNode("b")
    root.appendChild(b)
    let c = new TestNode("c")
    root.appendChild(c)

    t.true(root.firstChild === a)
    t.true(root.lastChild === c)
    t.true(root.parentNode === null)
    t.true(root.nextSibling === null)
    t.true(root.previousSibling === null)

    t.true(a.parentNode === root)
    t.true(a.firstChild === null)
    t.true(a.lastChild === null)
    t.true(a.previousSibling === null)
    t.true(a.nextSibling === b)

    t.true(b.parentNode === root)
    t.true(b.firstChild === null)
    t.true(b.lastChild === null)
    t.true(b.previousSibling === a)
    t.true(b.nextSibling === c)

    t.true(c.parentNode === root)
    t.true(c.firstChild === null)
    t.true(c.lastChild === null)
    t.true(c.previousSibling === b)
    t.true(c.nextSibling === null)

})

test("removeChild first", t => {
    let root = new TestNode("root")
    let a = new TestNode("a")
    root.appendChild(a)
    let b = new TestNode("b")
    root.appendChild(b)
    let c = new TestNode("c")
    root.appendChild(c)

    root.removeChild(a)

    t.true(root.firstChild === b)
    t.true(root.lastChild === c)
    t.true(root.parentNode === null)
    t.true(root.nextSibling === null)
    t.true(root.previousSibling === null)

    t.true(a.parentNode === null)
    t.true(a.firstChild === null)
    t.true(a.lastChild === null)
    t.true(a.previousSibling === null)
    t.true(a.nextSibling === null)

    t.true(b.parentNode === root)
    t.true(b.firstChild === null)
    t.true(b.lastChild === null)
    t.true(b.previousSibling === null)
    t.true(b.nextSibling === c)

    t.true(c.parentNode === root)
    t.true(c.firstChild === null)
    t.true(c.lastChild === null)
    t.true(c.previousSibling === b)
    t.true(c.nextSibling === null)

})

test("removeChild middle", t => {
    let root = new TestNode("root")
    let a = new TestNode("a")
    root.appendChild(a)
    let b = new TestNode("b")
    root.appendChild(b)
    let c = new TestNode("c")
    root.appendChild(c)

    root.removeChild(b)

    t.true(root.firstChild === a)
    t.true(root.lastChild === c)
    t.true(root.parentNode === null)
    t.true(root.nextSibling === null)
    t.true(root.previousSibling === null)

    t.true(a.parentNode === root)
    t.true(a.firstChild === null)
    t.true(a.lastChild === null)
    t.true(a.previousSibling === null)
    t.true(a.nextSibling === c)

    t.true(b.parentNode === null)
    t.true(b.firstChild === null)
    t.true(b.lastChild === null)
    t.true(b.previousSibling === null)
    t.true(b.nextSibling === null)

    t.true(c.parentNode === root)
    t.true(c.firstChild === null)
    t.true(c.lastChild === null)
    t.true(c.previousSibling === a)
    t.true(c.nextSibling === null)

})

test("removeChild last", t => {
    let root = new TestNode("root")
    let a = new TestNode("a")
    root.appendChild(a)
    let b = new TestNode("b")
    root.appendChild(b)
    let c = new TestNode("c")
    root.appendChild(c)

    root.removeChild(c)

    t.true(root.firstChild === a)
    t.true(root.lastChild === b)
    t.true(root.parentNode === null)
    t.true(root.nextSibling === null)
    t.true(root.previousSibling === null)

    t.true(a.parentNode === root)
    t.true(a.firstChild === null)
    t.true(a.lastChild === null)
    t.true(a.previousSibling === null)
    t.true(a.nextSibling === b)

    t.true(b.parentNode === root)
    t.true(b.firstChild === null)
    t.true(b.lastChild === null)
    t.true(b.previousSibling === a)
    t.true(b.nextSibling === null)

    t.true(c.parentNode === null)
    t.true(c.firstChild === null)
    t.true(c.lastChild === null)
    t.true(c.previousSibling === null)
    t.true(c.nextSibling === null)

})

test("removeChild middle from an actual Element", t => {
    let root = extendElementAsVirtualNodeRoot(document.createElement("canvas")) as INode

    // now apply node handlers
    let a = new TestNode("a")
    root.appendChild(a)
    let b = new TestNode("b")
    root.appendChild(b)
    let c = new TestNode("c")
    root.appendChild(c)

    root.removeChild(b)

    t.true(root.firstChild === a)
    t.true(root.lastChild === c)
    t.true(root.parentNode === null)
    t.true(root.nextSibling === null)
    t.true(root.previousSibling === null)

    t.true(a.parentNode === root)
    t.true(a.firstChild === null)
    t.true(a.lastChild === null)
    t.true(a.previousSibling === null)
    t.true(a.nextSibling === c)

    t.true(b.parentNode === null)
    t.true(b.firstChild === null)
    t.true(b.lastChild === null)
    t.true(b.previousSibling === null)
    t.true(b.nextSibling === null)

    t.true(c.parentNode === root)
    t.true(c.firstChild === null)
    t.true(c.lastChild === null)
    t.true(c.previousSibling === a)
    t.true(c.nextSibling === null)

})