import Buffer from "./Buffer"

export default class Size {

    width: number
    height: number

    constructor(width: number, height: number) {
        this.width = width
        this.height = height
    }

    add(b: Buffer) {
        return new Size(this.width + b.left + b.right, this.height + b.top + b.bottom)
    }

    subtract(b: Buffer) {
        return new Size(this.width - b.left - b.right, this.height - b.top - b.bottom)
    }

}
