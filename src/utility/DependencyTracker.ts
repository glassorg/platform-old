
const empty = new Set()

type Comparable = string | number | object

/**
 * Efficiently tracks dependency relationships between objects.
 * It has close to O(1) performance on add, remove and get.
 */
export default class DependencyTracker<Dependent extends Comparable, Dependee extends Comparable> {

    private dependeesToDependents = new Map<Dependee, Set<Dependent>>()
    private dependentsToDependees = new Map<Dependent, Set<Dependee>>()

    add(dependent: Dependent, dependee: Dependee) {
        let dependents = this.dependeesToDependents.get(dependee)
        if (dependents == null)
            this.dependeesToDependents.set(dependee, dependents = new Set())
        dependents.add(dependent)
        let dependees = this.dependentsToDependees.get(dependent)
        if (dependees == null)
            this.dependentsToDependees.set(dependent, dependees = new Set())
        dependees.add(dependee)
    }

    remove(dependent: Dependent) {
        let dependees = this.dependentsToDependees.get(dependent)
        if (dependees != null) {
            for (let dependee of dependees) {
                let dependents = this.dependeesToDependents.get(dependee)
                if (dependents != null) {
                    dependents.delete(dependent)
                    if (dependents.size === 0)
                        this.dependeesToDependents.delete(dependee)
                }
            }
        }
        this.dependentsToDependees.delete(dependent)
    }

    getDependents(dependee: Dependee): Set<Dependent> {
        return this.dependeesToDependents.get(dependee) || empty
    }

    getDependees(dependent: Dependent): Set<Dependee> {
        return this.dependentsToDependees.get(dependent) || empty
    }

}
