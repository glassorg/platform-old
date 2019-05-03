
/**
 * Represents a color and a lighter and darker variants of it.
 */
export default class ColorTriplet
{
    //  the color with lower contrast
    readonly weak: string
    //  the normal color
    readonly normal: string
    //  the color with higher contrast
    readonly strong: string

    constructor(weak, normal, strong) {
        this.weak = weak
        this.normal = normal
        this.strong = strong
    }

    //  the lightest color
    get light() {
        return this.strong > this.weak ? this.strong : this.weak
    }

    //  the darkest color
    get dark() {
        return this.strong < this.weak ? this.strong : this.weak
    }

    //  returns the normal color
    toString() {
        return this.normal
    }
}
