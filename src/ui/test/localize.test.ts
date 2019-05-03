import test from "ava"

import localize from "../localize"

test("localize", t => {
    t.true(localize`Hello ${0}` === "Hello 0")
    t.true(localize`${"Kris"}!!` === "Kris!!")
    t.true(localize`${"Kris"}` === "Kris")
    t.true(localize`Hello ${"Kris"}` === "Hello Kris")
    t.true(localize`Hello ${"Kris"}!` === "Hello Kris!")
    t.true(localize`Hello ${"Kris"}, ${"Kris"}!` === "Hello Kris, Kris!")
})