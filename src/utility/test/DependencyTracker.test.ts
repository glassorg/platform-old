import test from "ava"
import DependencyTracker from "../DependencyTracker"

test("DependencyTracker", t => {

    let tracker = new DependencyTracker<string, string>()
    tracker.add("x", "y")
    t.deepEqual(tracker.getDependents("y"), new Set(["x"]))
    t.deepEqual(tracker.getDependees("x"), new Set(["y"]))
    tracker.add("z", "y")
    t.deepEqual(tracker.getDependents("y"), new Set(["x", "z"]))
    t.deepEqual(tracker.getDependees("z"), new Set(["y"]))
    tracker.remove("x")
    t.deepEqual(tracker.getDependents("y"), new Set(["z"]))
    t.deepEqual(tracker.getDependees("x"), new Set())
    tracker.remove("z")
    t.deepEqual(tracker.getDependents("x"), new Set())
    t.deepEqual(tracker.getDependents("y"), new Set())
    t.deepEqual(tracker.getDependents("z"), new Set())
    t.deepEqual(tracker.getDependees("x"), new Set())
    t.deepEqual(tracker.getDependees("y"), new Set())
    t.deepEqual(tracker.getDependees("z"), new Set())
    // check that there is no memory leak => everything is now removed and empty
    t.true((tracker as any).dependeesToDependents.size === 0)
    t.true((tracker as any).dependentsToDependees.size === 0)

})
